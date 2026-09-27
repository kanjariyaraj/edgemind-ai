from enum import Enum
from typing import Set


class SensitivityLevel(str, Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    PRIVATE = "private"


SENSITIVITY_HIERARCHY = {
    SensitivityLevel.PUBLIC: 0,
    SensitivityLevel.INTERNAL: 1,
    SensitivityLevel.PRIVATE: 2,
}


def can_sync_to_cloud(sensitivity: str) -> bool:
    return sensitivity != SensitivityLevel.PRIVATE


def can_share_with_device(sensitivity: str, target_device_trust_level: int) -> bool:
    level = SENSITIVITY_HIERARCHY.get(SensitivityLevel(sensitivity), 1)
    return level <= target_device_trust_level


def validate_sensitivity(sensitivity: str) -> bool:
    return sensitivity in [s.value for s in SensitivityLevel]


def get_default_sync_policy(sensitivity: str) -> str:
    if sensitivity == SensitivityLevel.PRIVATE:
        return "local_only"
    elif sensitivity == SensitivityLevel.INTERNAL:
        return "sync_on_wifi"
    else:
        return "sync_always"