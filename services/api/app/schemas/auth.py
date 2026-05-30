from pydantic import BaseModel, Field

from app.schemas.api import ElderOut, UserRole


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: str
    phone: str
    name: str
    role: UserRole
    avatar_url: str | None = None
    community_site_id: str | None = None
    elder_id: str | None = None
    bound_elders: list[ElderOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class WechatLoginIn(BaseModel):
    code: str = Field(min_length=1)
    role: UserRole = "elder"


class PhoneOtpIn(BaseModel):
    phone: str = Field(min_length=11, max_length=11)
    role: UserRole = "elder"


class PhoneVerifyIn(BaseModel):
    phone: str = Field(min_length=11, max_length=11)
    code: str = Field(min_length=4, max_length=6)
    role: UserRole = "elder"
    name: str | None = None


class BindElderIn(BaseModel):
    elder_id: str
    relation: str = "家属"


TokenOut.model_rebuild()
