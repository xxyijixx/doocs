package config

type AppConfig struct {
	Name string `mapstructure:"name" default:"DefaultAppName"`
	Port int    `mapstructure:"port" default:"8888"`
}

type DBConfig struct {
	Host     string `mapstructure:"host" default:"127.0.0.1"`
	Port     int    `mapstructure:"port" default:"3306"`
	User     string `mapstructure:"user" default:"root"`
	Password string `mapstructure:"password" default:""`
}

type RedisConfig struct {
	Host string `mapstructure:"host" default:"127.0.0.1"`
	Port int    `mapstructure:"port" default:"6379"`
}

type DooTaskConfig struct {
	Token   string `mapstructure:"token" default:""`
	Version string `mapstructure:"version" default:"1.0.0"`
	WebHook string `mapstructure:"webhook" default:""`
}

type Config struct {
	App     AppConfig     `mapstructure:"app"`
	DB      DBConfig      `mapstructure:"db"`
	Redis   RedisConfig   `mapstructure:"redis"`
	DooTask DooTaskConfig `mapstructure:"dootask"`
}
