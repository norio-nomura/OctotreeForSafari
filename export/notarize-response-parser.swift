#!/usr/bin/env swift
import Foundation

var data = Data()
while let line = readLine(strippingNewline: false) {
    guard !line.hasPrefix("Generated JWT:"),
        let lineData = line.data(using: .utf8) else { continue }
    data.append(lineData)
}

extension String: Swift.Error {}

do {
    guard let plist = try PropertyListSerialization
        .propertyList(from: data, format: nil) as? [String: AnyObject] else {
        throw "Can not deserialize response!"
    }
    if let uuid = plist["notarization-upload"]?["RequestUUID"] as? String {
        print(uuid)
    } else if let status = plist["notarization-info"]?["Status"] as? String {
        guard ["success", "in progress"].contains(status) else {
            throw "Could not notarize package"
        }
        print(status)
    } else {
        throw "Can not parse response!"
    }
} catch {
    fputs("\(error)\n", stderr)
    data.withUnsafeBytes { bytes -> Void in
        fwrite(bytes.baseAddress, bytes.count, 1, stderr)
    }
    fputs("\n", stderr)
    exit(1)
}
