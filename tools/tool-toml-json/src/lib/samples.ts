export type Sample = { id: string; label: string; toml: string }

export const SAMPLES: Sample[] = [
  {
    id: 'basic',
    label: '基础配置',
    toml: `# 简单的应用配置
title = "My App"
version = "1.0.0"
debug = false

[server]
host = "127.0.0.1"
port = 8080

[database]
driver = "postgres"
url = "postgres://localhost/mydb"
pool_size = 10
`,
  },
  {
    id: 'cargo',
    label: 'Cargo.toml 风格',
    toml: `[package]
name = "my-crate"
version = "0.1.0"
edition = "2021"
authors = ["Alice <alice@example.com>", "Bob <bob@example.com>"]

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1", features = ["full"] }
log = "0.4"

[dev-dependencies]
criterion = "0.5"

[profile.release]
opt-level = 3
lto = true
`,
  },
  {
    id: 'nested',
    label: '嵌套表 + 数组',
    toml: `# 嵌套表 + 数组表（[[]]）+ 行内表
[user]
name = "Alice"
age = 30
nickname = "alie"

[user.address]
city = "Shanghai"
zip = "200000"

[[user.pets]]
name = "Mochi"
type = "cat"

[[user.pets]]
name = "Bao"
type = "dog"

tags = ["admin", "owner", "vip"]
inline = { color = "blue", size = "large" }
`,
  },
]
