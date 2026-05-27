from sqlalchemy import inspect, text


def ensure_subscription_billing_cycle(engine) -> None:
    inspector = inspect(engine)

    if "subscriptions" not in inspector.get_table_names():
        return

    column_names = {
        column["name"] for column in inspector.get_columns("subscriptions")
    }

    if "billing_cycle" in column_names:
        return

    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE subscriptions "
                "ADD COLUMN billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly'"
            )
        )


def ensure_user_photo_url(engine) -> None:
    inspector = inspect(engine)

    if "users" not in inspector.get_table_names():
        return

    column_names = {
        column["name"] for column in inspector.get_columns("users")
    }

    if "photo_url" in column_names:
        return

    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN photo_url TEXT NULL"))
