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


# ============================================================================
# Advanced Ticketing System (Service A)
# ============================================================================

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String, unique=True, index=True, nullable=False)   # e.g. TCK-000123
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    status = Column(String, default="new")      # new|triage|open|in_progress|pending_vendor|escalated|awaiting_approval|resolved|closed
    priority = Column(String, default="p3")     # p1|p2|p3|p4
    category = Column(String, default="other")  # incident|service_request|problem|change|vulnerability|other
    source = Column(String, default="manual")   # manual|alert|api|email|discovery
    assignee = Column(String, nullable=True)
    reporter = Column(String, nullable=True)
    tags = Column(JSON, default=list)
    asset = Column(String, nullable=True)       # hostname / IP link
    vulnerability_ref = Column(String, nullable=True)  # CVE tracking

    # AI-assisted classification & prioritization
    ai_category = Column(String, nullable=True)
    ai_priority = Column(String, nullable=True)
    ai_confidence = Column(Integer, nullable=True)
    ai_reasoning = Column(JSON, default=list)
    ai_predicted_root_cause = Column(String, nullable=True)
    duplicate_of = Column(String, nullable=True)
    triaged_at = Column(DateTime(timezone=True), nullable=True)

    # SLA
    sla_response_minutes = Column(Integer, nullable=True)
    sla_resolution_minutes = Column(Integer, nullable=True)
    due_response_at = Column(DateTime(timezone=True), nullable=True)
    due_resolve_at = Column(DateTime(timezone=True), nullable=True)
    first_response_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    escalation_level = Column(Integer, default=0)

    # Link to originating alert (automation from Notification Engine)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class TicketEvidence(Base):
    """Evidence vault — immutable-style records attached to tickets."""
    __tablename__ = "ticket_evidence"

    id = Column(Integer, primary_key=True, index=True)
    ticket_uid = Column(String, index=True, nullable=False)
    kind = Column(String, default="log")        # log|screenshot|pcap|hash|report|email
    name = Column(String, nullable=False)
    content = Column(Text, default="")
    size_kb = Column(Integer, default=0)
    sha256 = Column(String, nullable=False)     # fingerprint (immutable-style)
    collected_by = Column(String, default="system")
    immutable = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TicketAuditEntry(Base):
    """Hash-chained audit history per ticket (tamper-evident)."""
    __tablename__ = "ticket_audit_entries"

    id = Column(Integer, primary_key=True, index=True)
    ticket_uid = Column(String, index=True, nullable=False)
    seq = Column(Integer, nullable=False)
    actor = Column(String, nullable=False)
    action = Column(String, nullable=False)
    detail = Column(Text, default="")
    prev_hash = Column(String, default="0" * 24)
    entry_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TicketApproval(Base):
    """Approval workflow for evidence-based closure."""
    __tablename__ = "ticket_approvals"

    id = Column(Integer, primary_key=True, index=True)
    ticket_uid = Column(String, index=True, nullable=False)
    step = Column(Integer, default=1)
    approver_role = Column(String, default="client_admin")
    status = Column(String, default="pending")  # pending|approved|rejected
    note = Column(Text, default="")
    decided_by = Column(String, nullable=True)
    decided_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ============================================================================
# Notification & Event Intelligence Engine (Service B)
# ============================================================================

class Alert(Base):
    """Inbound security/monitoring event. Triggers notification rules and,
    when configured, automatically creates tickets."""
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String, unique=True, index=True, nullable=False)   # ALR-000123
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    severity = Column(String, default="medium")   # critical|high|medium|low|info
    source = Column(String, default="siem")       # siem|wazuh|snmp|syslog|api|nmap|manual
    resource = Column(String, nullable=True)      # affected host/device
    raw_payload = Column(JSON, default=dict)
    dedup_key = Column(String, index=True, nullable=True)
    correlated_count = Column(Integer, default=1)  # alert correlation
    storm_suppressed = Column(Boolean, default=False)
    acked_by = Column(String, nullable=True)
    acked_at = Column(DateTime(timezone=True), nullable=True)
    ticket_uid = Column(String, nullable=True, index=True)  # auto-created ticket
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class NotificationRule(Base):
    """Visual rule builder: match conditions -> actions (notify / auto-ticket)."""
    __tablename__ = "notification_rules"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True, index=True)  # None = platform-global rule
    name = Column(String, nullable=False)
    enabled = Column(Boolean, default=True)
    conditions = Column(JSON, default=dict)   # {severity:[...],source:[...],contains:"...",max_per_hour:n}
    channels = Column(JSON, default=list)     # ["in_app","email","sms","webhook"]
    recipients = Column(JSON, default=list)
    create_ticket = Column(Boolean, default=False)
    ticket_priority = Column(String, default="p3")
    escalate_after_minutes = Column(Integer, default=0)  # 0 = no escalation
    quiet_hours = Column(JSON, nullable=True)  # {"start":"22:00","end":"07:00"}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=True, index=True)
    rule_id = Column(Integer, ForeignKey("notification_rules.id"), nullable=True)
    channel = Column(String, nullable=False)     # in_app|email|sms|webhook
    recipient = Column(String, default="")
    subject = Column(String, nullable=False)
    body = Column(Text, default="")
    severity = Column(String, default="medium")
    status = Column(String, default="queued")    # queued|sent|failed|dead_letter|suppressed|acked
    attempts = Column(Integer, default=0)
    last_error = Column(Text, nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    acked_by = Column(String, nullable=True)
    acked_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ============================================================================
# SNMP Credentials & Network Auto-Discovery
# ============================================================================

class SnmpCredential(Base):
    __tablename__ = "snmp_credentials"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    version = Column(String, default="v2c")            # v1|v2c|v3
    community = Column(String, nullable=True)          # v1/v2c
    username = Column(String, nullable=True)           # v3
    auth_protocol = Column(String, nullable=True)      # MD5|SHA|SHA256
    auth_passphrase = Column(String, nullable=True)
    priv_protocol = Column(String, nullable=True)      # DES|AES128|AES256
    priv_passphrase = Column(String, nullable=True)
    port = Column(Integer, default=161)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class DiscoveryScan(Base):
    __tablename__ = "discovery_scans"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    network_cidr = Column(String, nullable=False)      # e.g. 192.168.1.0/24
    status = Column(String, default="queued")          # queued|running|completed|failed|cancelled
    credential_ids = Column(JSON, default=list)        # snmp credential ids to test
    total_hosts = Column(Integer, default=0)
    discovered = Column(Integer, default=0)
    snmp_matched = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(String, default="system")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DiscoveredDevice(Base):
    __tablename__ = "discovered_devices"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("discovery_scans.id"), nullable=False, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    ip = Column(String, nullable=False)
    mac = Column(String, nullable=True)
    hostname = Column(String, nullable=True)
    os_guess = Column(String, nullable=True)
    device_type = Column(String, nullable=True)        # server|workstation|network|iot|printer|unknown
    open_ports = Column(JSON, default=list)
    snmp_match = Column(Boolean, default=False)
    sys_desc = Column(String, nullable=True)
    imported = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
