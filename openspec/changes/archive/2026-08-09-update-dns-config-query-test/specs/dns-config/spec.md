# dns-config

## MODIFIED Requirements

### Requirement: 多 DNS 延迟测试

工具 SHALL 支持对列表中任意勾选的多个 DNS 服务商（及用户输入的自定义 DoH 地址）做延迟与实际查询测试：用户可指定查询域名（默认 `google.com`）与记录类型（A/AAAA/CNAME/MX/NS/TXT，默认 A），工具通过浏览器 `fetch` 对应服务商的 DoH endpoint 发起真实查询并多次采样计时，计算平均/最小/最大响应时间并解析出查询结果（记录值列表），按延迟从低到高排序展示结果；无 DoH endpoint 的服务商 SHALL 标记为无法测试。

#### Scenario: 勾选多个 DNS 查询并测速

- **WHEN** 用户输入域名与记录类型，勾选 3 个 DNS 服务商并点击"测试延迟"
- **THEN** 界面依次显示这 3 个服务商的平均延迟与解析出的记录值，并按延迟升序排列

#### Scenario: 单个服务商测试失败

- **WHEN** 某个 DoH endpoint 请求失败、超时，或响应不含有效记录，或该服务商无 DoH endpoint
- **THEN** 该服务商的结果标记为失败，不影响其余服务商的展示
