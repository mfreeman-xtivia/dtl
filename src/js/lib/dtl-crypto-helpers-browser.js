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
const md5 = require("./md5.js");

const algorithms = {
    "sha1": "SHA-1",
    "sha256": "SHA-256",
    "sha512": "SHA-512"
}

function calculate_hash(method, data) {
    let bytes = data;
    if (method == 'md5') {
        return md5(data);
    } else {
        throw new Error('This DTL build does not include hash methods apart from md5. rebuild with crypto enabled.');
    }
}

let crypto_helper_list = {
    'hash': {
        'meta': {
            'syntax': 'hash( $method $data )',
            'returns': 'A hash of the provided data using $method',
            'description': [
                'Returns a hash of the provided $data using $method. Supported methods are ',
                'MD5. Note that by default the browser version only includes md5. See ',
                'https://gitlab.com/jk0ne/DTL/-/issues/9 for details.'
            ]
        },
        '*': function(method, data) {
            try {
                let hash = calculate_hash(method, data);
                return hash;
            } catch (e) {
                console.warn("Failed creating hash: " + e);
                return '';
            }
        },
    }
};

function dtl_crypto_helpers() {
    return crypto_helper_list;
}

module.exports = dtl_crypto_helpers;
