/* =================================================
 * Copyright (c) 2015-2022 Jay Kuri
 *
 * This file is part of DTL.
 *
 * DTL is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * DTL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with DTL; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 * =================================================
 */
const crypto = require("crypto");
const md5 = require("./md5.js");

const algorithms = {
    "sha1": "SHA-1",
    "sha256": "SHA-256",
    "sha512": "SHA-512"
}

function calculate_hash(method, data) {
    let bytes = data;
    if(typeof data == 'string') {
        bytes = new TextEncoder().encode(data);
    }
    if (typeof crypto.createHash == 'function') {
        return node_crypto_hash(method, data);
    } else {
        throw new Error('This DTL build does not include access to crypto functions.');
    }
}

function node_crypto_hash(method, data) {
    let hash = crypto.createHash(method);
    return hash.update(data).digest('hex');
}

let helper_list = {
    'hash': {
        'meta': {
            'syntax': 'hash( $method $data )',
            'returns': 'A hash of the provided data using $method',
            'description': [
                'Returns a hash of the provided $data using $method. Supported methods are ',
                'SHA1, SHA256, SHA512, and MD5. Note that by default the browser version ',
                'only includes md5. See https://gitlab.com/jk0ne/DTL/-/issues/9 for details.'
            ]
        },
        '*': function(method, data) {
            try {
                let hash = calculate_hash(method, data);
                return hash;
            } catch (e) {
                console.warn("Failed creating hash: " + e);
                return undefined;
            }
        },
    }
};

module.exports = function() {
    // console.log(Object.keys(helper_list).sort());
    return helper_list;
};
