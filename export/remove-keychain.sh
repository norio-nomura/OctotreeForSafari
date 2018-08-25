#!/bin/sh

[ -z "$KEY_PASSWORD" ] && exit 0

export KEYCHAIN=export.keychain

security delete-keychain $KEYCHAIN
