"""
app/api/admin.py
────────────────
Admin-only endpoints. Require is_admin=True on the authenticated user.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user

router = APIRouter()


def require_admin(current_user=Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


@router.get("/stats")
def admin_stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    from app.models.user import User
    from app.models.child import Child
    from app.models.module import SkillModule
    from app.models.lesson import Lesson
    from app.models.scenario import ScenarioAttempt

    total_parents  = db.query(User).filter_by(is_admin=False).count()
    total_children = db.query(Child).count()
    total_modules  = db.query(SkillModule).count()
    total_lessons  = db.query(Lesson).count()
    total_attempts = db.query(ScenarioAttempt).count()
    completed      = db.query(ScenarioAttempt).filter_by(status="completed").count()

    from sqlalchemy import func
    total_xp = db.query(func.sum(Child.total_xp)).scalar() or 0

    return {
        "total_parents":   total_parents,
        "total_children":  total_children,
        "total_modules":   total_modules,
        "total_lessons":   total_lessons,
        "total_attempts":  total_attempts,
        "completed_attempts": completed,
        "total_xp_earned": int(total_xp),
    }


@router.get("/users")
def admin_list_users(db: Session = Depends(get_db), _=Depends(require_admin)):
    from app.models.user import User
    from app.models.child import Child
    from sqlalchemy import func

    rows = (
        db.query(
            User.id,
            User.email,
            User.full_name,
            User.is_active,
            User.is_admin,
            User.created_at,
            func.count(Child.id).label("child_count"),
        )
        .outerjoin(Child, Child.parent_id == User.id)
        .group_by(User.id)
        .order_by(User.created_at.desc())
        .all()
    )

    return [
        {
            "id": r.id,
            "email": r.email,
            "full_name": r.full_name,
            "is_active": r.is_active,
            "is_admin": r.is_admin,
            "created_at": r.created_at.isoformat(),
            "child_count": r.child_count,
        }
        for r in rows
    ]


@router.get("/children")
def admin_list_children(db: Session = Depends(get_db), _=Depends(require_admin)):
    from app.models.child import Child
    from app.models.user import User

    rows = (
        db.query(Child, User.email.label("parent_email"))
        .join(User, User.id == Child.parent_id)
        .order_by(Child.total_xp.desc())
        .all()
    )

    return [
        {
            "id": c.id,
            "display_name": c.display_name,
            "age": c.age,
            "total_xp": c.total_xp,
            "parent_email": pe,
            "is_active": c.is_active,
        }
        for c, pe in rows
    ]
