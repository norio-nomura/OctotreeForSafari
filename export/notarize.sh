#!/bin/sh
set -o pipefail

function echo2() {
   echo "$@" 1>&2
}

function assert() {
    ret=$?
    (($ret != 0)) && echo2 "$@" && exit $ret
}

[[ -n "${API_KEY}" ]] || assert "Missing API_KEY environment variable"
[[ -n "${API_ISSUER}" ]] || assert "Missing API_ISSUER environment variable"

readonly APP_PATH="$1" ZIP_PATH="$2"
[[ -d "${APP_PATH}" && -n "${ZIP_PATH}" ]] || assert "Missing parameters"

readonly INFO_PLIST="${APP_PATH}/Contents/Info.plist"
[[ -f "${INFO_PLIST}" ]] || assert "Missing ${INFO_PLIST}"
typeset BUNDLE_ID && BUNDLE_ID=$(
    /usr/libexec/PlistBuddy -c "print :CFBundleIdentifier" "${INFO_PLIST}"
) || assert "Missing CFBundleIdentifier"
readonly BUNDLE_ID

echo2 "Detecting Bundle ID"
readonly RESPONSE_PARSER="$(dirname $0)/notarize-response-parser.swift"
[[ -x "${RESPONSE_PARSER}" ]] || assert "Missing ${RESPONSE_PARSER}"

echo2 "Creating ${ZIP_PATH}..."
readonly CREATE_ZIP=(
    /usr/bin/ditto -c -k --keepParent "${APP_PATH}" "${ZIP_PATH}"
)
"${CREATE_ZIP[@]}" || assert "Failed: ${CREATE_ZIP[@]}"

echo2 "Uploading "${ZIP_PATH}" to the Notarization Service..."
readonly NOTARIZE_APP=(
    xcrun altool --notarize-app --file "${ZIP_PATH}"
    --primary-bundle-id "${BUNDLE_ID}"
    --apiKey "${API_KEY}"
    --apiIssuer "${API_ISSUER}"
    --output-format xml
    "${VERBOSE:+--verbose}"
)
typeset UUID && UUID=$(
    "${NOTARIZE_APP[@]}" | "${RESPONSE_PARSER}"
) || assert "Failed: ${NOTARIZE_APP[@]} | ${RESPONSE_PARSER}"
readonly UUID
echo2 "Uploaded!"

readonly NOTARIZATION_INFO=(
    xcrun altool --notarization-info "${UUID}"
    --apiKey "${API_KEY}"
    --apiIssuer "${API_ISSUER}"
    --output-format xml
    "${VERBOSE:+--verbose}"
)
typeset status
while echo2 "Waiting 30 seconds..." && sleep 30 &&
    echo2 "Querying Notarization Info for ${UUID}..." &&
    status=$("${NOTARIZATION_INFO[@]}" | "${RESPONSE_PARSER}"); do
    [[ "${status}" == "success" ]] && echo2 "Package Approved!" && break
done || assert "Failed: ${NOTARIZATION_INFO[@]} | ${RESPONSE_PARSER}"

readonly STAPLE=(
    xcrun stapler staple "${VERBOSE:+--verbose}" "${APP_PATH}"
)
echo2 "Stapling ${APP_PATH}..."
"${STAPLE[@]}" || assert "Failed: ${STAPLE[@]}"

echo2 "Updating ${ZIP_PATH}..."
"${CREATE_ZIP[@]}" || assert "Failed: ${CREATE_ZIP[@]}"

echo2 "Done: ${ZIP_PATH}"
