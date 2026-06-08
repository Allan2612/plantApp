import pytest
from pydantic import ValidationError

from app.models import (
    CareRuleInput,
    CompleteCareTaskRequest,
    CreateCareTaskRequest,
    UpdateCareTaskRequest,
)


def test_care_rule_input_valid():
    rule = CareRuleInput(type="watering", intervalDays=3, notes="ok")
    assert rule.type == "watering"
    assert rule.intervalDays == 3
    assert rule.anchorDate is None


def test_care_rule_input_invalid_type_rejected():
    with pytest.raises(ValidationError):
        CareRuleInput(type="alien", intervalDays=3)


def test_care_rule_input_extra_field_rejected():
    with pytest.raises(ValidationError):
        CareRuleInput(type="watering", intervalDays=3, evil="x")


def test_create_care_task_request_minimum():
    req = CreateCareTaskRequest(
        userId="u1", userPlantId="p1", type="pruning", scheduledFor="2026-06-01"
    )
    assert req.userPlantId == "p1"
    assert req.notes is None


def test_update_care_task_request_all_optional():
    req = UpdateCareTaskRequest()
    assert req.scheduledFor is None
    assert req.status is None


def test_complete_care_task_request_all_optional():
    req = CompleteCareTaskRequest()
    assert req.completedAt is None
