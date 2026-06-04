PASSWORD_REQUIREMENTS_MESSAGE = (
    "Password minimal 8 karakter, wajib memiliki huruf besar dan angka"
)


def validate_password_strength(value: str) -> str:
    if len(value) < 8:
        raise ValueError(PASSWORD_REQUIREMENTS_MESSAGE)
    if not any(char.isupper() for char in value):
        raise ValueError(PASSWORD_REQUIREMENTS_MESSAGE)
    if not any(char.isdigit() for char in value):
        raise ValueError(PASSWORD_REQUIREMENTS_MESSAGE)
    return value
