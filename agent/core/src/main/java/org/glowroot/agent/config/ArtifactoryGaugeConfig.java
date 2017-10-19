/*
 * Copyright 2011-2017 the original author or authors.
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
package org.glowroot.agent.config;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

/**
 * Generates a list of useful default gauges that should be monitored
 */
public class ArtifactoryGaugeConfig {

    private static final Logger logger = LoggerFactory.getLogger(ArtifactoryGaugeConfig.class);
    /**
     * Generates a list of Gauges that should be monitored for Artifactory
     * @return A list of Artifactory-centric gauges
     */
    public  ImmutableList<GaugeConfig> getDefaultGaugeConfigs() {
        List<GaugeConfig> artGaugeConfig = Lists.newArrayList();
        artGaugeConfig.add(ImmutableGaugeConfig.builder()
                .mbeanObjectName("org.jfrog.artifactory:instance=Artifactory, type=Storage,prop=Binary Storage")
                .addMbeanAttributes(ImmutableMBeanAttribute.of("Size", false))
                .build());
        artGaugeConfig.add(ImmutableGaugeConfig.builder()
                .mbeanObjectName("org.jfrog.artifactory:instance=Artifactory, type=Storage,prop=Data Source")
                .addMbeanAttributes(ImmutableMBeanAttribute.of("ActiveConnectionsCount", false))
                .addMbeanAttributes(ImmutableMBeanAttribute.of("IdleConnectionsCount", false))
                .addMbeanAttributes(ImmutableMBeanAttribute.of("MaxActive", false))
                .addMbeanAttributes(ImmutableMBeanAttribute.of("MaxIdle", false))
                .addMbeanAttributes(ImmutableMBeanAttribute.of("MaxWait", false))
                .build());
        artGaugeConfig.addAll(getTomcatGaugeConfigs());
        return ImmutableList.copyOf(artGaugeConfig);
    }

    /**
     * Generates a list of gauges of the underlying Tomcat that should be monitored
     * @return A list of tomcat gauges
     */
    private  ImmutableList<GaugeConfig> getTomcatGaugeConfigs() {
        List<GaugeConfig> tomcatGaugeConfigs = Lists.newArrayList();
        tomcatGaugeConfigs.add(ImmutableGaugeConfig.builder()
                .mbeanObjectName("Catalina:type=ThreadPool,name=*")
                .addMbeanAttributes(ImmutableMBeanAttribute.of("currentThreadsBusy", false))
                .addMbeanAttributes(ImmutableMBeanAttribute.of("currentThreadCount", false))
                .addMbeanAttributes(ImmutableMBeanAttribute.of("maxThreads", false))
                .addMbeanAttributes(ImmutableMBeanAttribute.of("minSpareThreads", false))
                .build());
        return ImmutableList.copyOf(tomcatGaugeConfigs);
    }
}