"""Seeding utilities for production deployments.

`ensure_platform_admin` runs at startup: if no platform admin exists it creates
one from env vars (PLATFORM_ADMIN_EMAIL / PLATFORM_ADMIN_PASSWORD, defaulting to
admin@infracentra.io / Admin#2026) so the very first login is possible without
manual SQL.

`seed_demo_tenant` lets a platform admin create a full working tenant (org +
client admin + auto-ticketing notification rules) in one click from Settings.
"""
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import get_password_hash
from app.models import User, Organization, NotificationRule


async def ensure_platform_admin(db: AsyncSession) -> None:
    existing = (await db.execute(
        select(User).where(User.role == "platform_admin").limit(1)
    )).scalars().first()
    if existing:
        return
    email = os.getenv("PLATFORM_ADMIN_EMAIL", "admin@infracentra.io")
    password = os.getenv("PLATFORM_ADMIN_PASSWORD", "Admin#2026")
    db.add(User(
        email=email, name="Platform Administrator", role="platform_admin",
        hashed_password=get_password_hash(password), status="active", mfa_enabled=False,
    ))
    await db.commit()


async def seed_demo_tenant(db: AsyncSession, *, email: str, password: str, org_name: str) -> dict:
    dup = (await db.execute(select(User).where(User.email == email))).scalars().first()
    if dup:
        raise ValueError(f"User {email} already exists")
    org = Organization(name=org_name, tier="professional", status="active",
                       contact_email=email, member_count=1)
    db.add(org)
    await db.flush()

    admin = User(email=email, name=f"{org_name} Admin", role="client_admin",
                 org_id=org.id, hashed_password=get_password_hash(password),
                 status="active", mfa_enabled=False)
    db.add(admin)

    # Default automation: critical & high alerts notify + auto-create tickets
    db.add_all([
        NotificationRule(
            org_id=None, name="Global: Critical incidents → page SOC + auto-ticket P1",
            enabled=True, conditions={"severity": ["critical"]},
            channels=["in_app", "email"], recipients=["soc-team@infracentra.io"],
            create_ticket=True, ticket_priority="p1", escalate_after_minutes=30,
        ),
        NotificationRule(
            org_id=org.id, name=f"{org_name}: High alerts → notify + auto-ticket P2",
            enabled=True, conditions={"severity": ["high"]},
            channels=["in_app"], recipients=[email],
            create_ticket=True, ticket_priority="p2",
        ),
        NotificationRule(
            org_id=org.id, name=f"{org_name}: Discovery events → log only",
            enabled=True, conditions={"source": ["nmap", "snmp"]},
            channels=["in_app"], recipients=["noc"],
            create_ticket=False,
        ),
    ])
    await db.commit()
    await db.refresh(org)
    await db.refresh(admin)
    return {
        "organization": {"id": org.id, "name": org.name},
        "client_admin": {"id": admin.id, "email": admin.email},
        "rules_created": 3,
    }
