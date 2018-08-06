package org.checkerframework.checker.nullness.qual;

import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;

@Target(FIELD)
public @interface MonotonicNonNull {}
