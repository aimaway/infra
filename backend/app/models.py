from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    tier = Column(String, nullable=False)  # sme, mid-market, enterprise
    status = Column(String, default="active")  # active, suspended, pending
    contact_email = Column(String, nullable=False)
    contact_phone = Column(String)
    industry = Column(String)
    country = Column(String)
    member_count = Column(Integer, default=0)
    asset_count = Column(Integer, default=0)
    risk_score = Column(Integer, default=0)
    compliance_score = Column(Integer, default=0)
    contract_start = Column(DateTime)
    contract_end = Column(DateTime)
    monthly_revenue = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    users = relationship("User", back_populates="organization")
    entitlements = relationship("Entitlement", back_populates="organization")
    audit_logs = relationship("AuditLog", back_populates="organization")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # platform_admin, client_admin, client_user
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    status = Column(String, default="active")
    mfa_enabled = Column(Boolean, default=False)
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="users")


class Entitlement(Base):
    __tablename__ = "entitlements"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    service_id = Column(String, nullable=False)
    enabled = Column(Boolean, default=False)
    seat_count = Column(Integer, default=0)
    activated_at = Column(DateTime(timezone=True))
    deactivated_at = Column(DateTime(timezone=True))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="entitlements")


class Integration(Base):
    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    service_id = Column(String, nullable=False)
    integration_type = Column(String, nullable=False)  # api, webhook, agent, native
    status = Column(String, default="inactive")  # active, inactive, pending
    license_type = Column(String, nullable=False)  # open-source, commercial, freemium
    pricing = Column(String, nullable=False)  # free, paid, custom
    api_key = Column(String)
    api_endpoint = Column(String)
    documentation_url = Column(String)
    last_sync = Column(DateTime(timezone=True))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    actor_name = Column(String, nullable=False)
    actor_role = Column(String, nullable=False)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    action = Column(String, nullable=False)
    resource = Column(String, nullable=False)
    resource_id = Column(String, nullable=False)
    details = Column(Text)
    ip_address = Column(String)
    outcome = Column(String, nullable=False)  # success, failure, blocked
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="audit_logs")
