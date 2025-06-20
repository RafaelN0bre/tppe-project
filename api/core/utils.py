import os
import math

from pathlib import Path
from datetime import datetime, timezone

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.serialization import pkcs12


def get_tmp_folder() -> Path:
    if os.name == "nt":
        return Path("C:/temp")
    else:
        return Path("/tmp")


def convert_pfx_to_pem(pfx_bytes: bytes) -> str:
    """Converts a PFX/PKCS#12 certificate to PEM format."""
    private_key, certificate, additional_certificates = pkcs12.load_key_and_certificates(
        pfx_bytes, None  # Replace `None` with password if required
    )

    pem = []

    # Convert the private key
    if private_key:
        pem.append(private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ).decode())

    # Convert the main certificate
    if certificate:
        pem.append(certificate.public_bytes(serialization.Encoding.PEM).decode())

    # Convert additional certificates (CA chain)
    for ca_cert in additional_certificates or []:
        pem.append(ca_cert.public_bytes(serialization.Encoding.PEM).decode())

    return "\n".join(pem)

def get_remaining_seconds(expiration: str) -> float:
    """
    Calculate the remaining seconds until the given expiration time.

    The expiration string should be in ISO 8601 format with a 'Z' suffix,
    indicating it is in UTC (e.g., "2025-03-12T18:26:39Z").

    Args:
        expiration (str): The expiration time as a string in ISO 8601 UTC format.

    Returns:
        float: The number of seconds remaining until expiration.
               If the expiration has passed, the value will be negative.
               Returns None if the expiration string cannot be parsed.

    Example:
        >>> remaining = get_remaining_seconds("2025-03-12T18:26:39Z")
        >>> print(remaining)
        3600.0
    """
    expiration_dt = datetime.strptime(expiration, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)

    now_utc = datetime.now(timezone.utc)

    remaining_seconds = (expiration_dt - now_utc).total_seconds()
    return math.ceil(remaining_seconds)
