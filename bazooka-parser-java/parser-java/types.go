package main

type ConfigJava struct {
	Language      string   "language"
	BeforeInstall []string "before_install,omitempty"
	Install       []string "install,omitempty"
	BeforeScript  []string "before_script,omitempty"
	Script        []string "script,omitempty"
	AfterScript   []string "after_script,omitempty"
	AfterSuccess  []string "after_success,omitempty"
	AfterFailure  []string "after_failure,omitempty"
	Env           []string "env,omitempty"
	JdkVersions   []string "jdk,omitempty"
	FromImage     string   "from"
}
