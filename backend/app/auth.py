import bcrypt

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Hybrid validation check
    # Bcrypt hashes typically start with $2a$, $2b$, or $2y$ and are 60 characters long
    if not (hashed_password.startswith("$2") and len(hashed_password) == 60):
        # Fallback to plain text comparison for legacy database entries
        return plain_password == hashed_password
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False
