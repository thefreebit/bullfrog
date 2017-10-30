/*
 * Copyright 2017 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.glowroot.central;

import com.google.common.base.Strings;

import javax.security.auth.callback.*;
import javax.security.sasl.AuthorizeCallback;
import javax.security.sasl.RealmCallback;
import java.io.IOException;

public class SaslCallbackHandler implements CallbackHandler {

    private final char[] password;

    public SaslCallbackHandler() {
        String jgroupsPassword = System.getProperty("jgroups.password");
        if (Strings.isNullOrEmpty(jgroupsPassword)) {
            throw new IllegalStateException("jgroups.password in bullfrog-central.properties is"
                    + " required, this can be set to any text, and is used by the glowroot central"
                    + " nodes to authenticate with one another and prevent rogue nodes from joining"
                    + " the cluster");
        }
        password = jgroupsPassword.toCharArray();
    }

    @Override
    public void handle(Callback[] callbacks) throws IOException, UnsupportedCallbackException {
        for (Callback callback : callbacks) {
            if (callback instanceof AuthorizeCallback) {
                AuthorizeCallback authorizeCallback = (AuthorizeCallback) callback;
                String authenticationId = authorizeCallback.getAuthenticationID();
                String authorizationId = authorizeCallback.getAuthorizationID();
                authorizeCallback.setAuthorized(authenticationId.equals(authorizationId));
            } else if (callback instanceof NameCallback) {
                ((NameCallback) callback).setName("glowroot");
            } else if (callback instanceof PasswordCallback) {
                ((PasswordCallback) callback).setPassword(password);
            } else if (callback instanceof RealmCallback) {
                ((RealmCallback) callback).setText("glowroot");
            }
        }
    }
}
