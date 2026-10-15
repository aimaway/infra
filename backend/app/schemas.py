from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    org_id: Optional[int] = None


class UserResponse(UserBase):
    id: int
    org_id: Optional[int]
    status: str
    mfa_enabled: bool
    last_login: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None


# Organization schemas
class OrganizationBase(BaseModel):
    name: str
    tier: str
    contact_email: EmailStr


class OrganizationCreate(OrganizationBase):
    contact_phone: Optional[str] = None
    industry: Optional[str] = None
    country: Optional[str] = None


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    tier: Optional[str] = None
    status: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    industry: Optional[str] = None
    country: Optional[str] = None
    member_count: Optional[int] = None
    asset_count: Optional[int] = None
    risk_score: Optional[int] = None
    compliance_score: Optional[int] = None
    contract_start: Optional[datetime] = None
    contract_end: Optional[datetime] = None
    monthly_revenue: Optional[int] = None


class OrganizationResponse(OrganizationBase):
    id: int
    status: str
    contact_phone: Optional[str]
    industry: Optional[str]
    country: Optional[str]
    member_count: int
    asset_count: int
    risk_score: int
    compliance_score: int
    contract_start: Optional[datetime]
    contract_end: Optional[datetime]
    monthly_revenue: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Entitlement schemas
class EntitlementBase(BaseModel):
    service_id: str
    enabled: bool = False
    seat_count: int = 0


class EntitlementCreate(EntitlementBase):
    org_id: int
    notes: Optional[str] = None


class EntitlementUpdate(BaseModel):
    enabled: Optional[bool] = None
    seat_count: Optional[int] = None
    notes: Optional[str] = None


class EntitlementResponse(EntitlementBase):
    id: int
    org_id: int
    activated_at: Optional[datetime]
    deactivated_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Integration schemas
class IntegrationBase(BaseModel):
    name: str
    service_id: str
    integration_type: str
    license_type: str
    pricing: str


class IntegrationCreate(IntegrationBase):
    status: str = "inactive"
    api_key: Optional[str] = None
    api_endpoint: Optional[str] = None
    documentation_url: Optional[str] = None
    notes: Optional[str] = None


class IntegrationUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    api_key: Optional[str] = None
    api_endpoint: Optional[str] = None
    documentation_url: Optional[str] = None
    notes: Optional[str] = None


class IntegrationResponse(IntegrationBase):
    id: int
    status: str
    api_key: Optional[str]
    api_endpoint: Optional[str]
    documentation_url: Optional[str]
    last_sync: Optional[datetime]
    notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class IntegrationTestResult(BaseModel):
    success: bool
    message: str
    details: Optional[dict] = None


# Audit Log schemas
class AuditLogCreate(BaseModel):
    actor_id: Optional[int] = None
    actor_name: str
    actor_role: str
    org_id: Optional[int] = None
    action: str
    resource: str
    resource_id: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    outcome: str


class AuditLogResponse(AuditLogCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
