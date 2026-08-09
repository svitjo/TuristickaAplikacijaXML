#!/bin/bash
set -e
export MongoDB__ConnectionString="${MongoDB__ConnectionString:-$MONGODB_URI}"
export Jwt__Key="${Jwt__Key:-TourisAuthSuperSecretKey_ChangeInProduction_32chars!}"
export Jwt__Issuer=AuthService
export Jwt__Audience=TourisApp
exec "$@"
