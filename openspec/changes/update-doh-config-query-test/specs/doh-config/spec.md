# doh-config

## MODIFIED Requirements

### Requirement: DoH 连通性/延迟测试与实际查询

工具 SHALL 支持对列表中任意勾选的多个 DoH 提供商（及用户输入的自定义 endpoint）做连通性、延迟与实际 DNS 查询测试：用户可指定查询域名（默认 `google.com`）与记录类型（A/AAAA/CNAME/MX/TXT/NS，默认 A），工具通过浏览器 `fetch` 对每个勾选的 endpoint 发起真实 DoH 查询，计算平均/最小/最大响应时间并解析出查询结果（记录值列表），按延迟从低到高排序展示；请求失败、超时或解析出的响应中不含有效 `Answer` 记录的 endpoint SHALL 标记为不可用而非影响其余结果。

#### Scenario: 勾选多个 DoH 查询并测速

- **WHEN** 用户输入域名与记录类型，勾选 3 个 DoH 提供商并点击"测试"
- **THEN** 界面依次显示这 3 个提供商的平均延迟与解析出的记录值，并按延迟升序排列

#### Scenario: 单个 endpoint 查询失败

- **WHEN** 某个 DoH endpoint 请求失败、超时，或响应不含有效记录
- **THEN** 该提供商的结果标记为不可用，不影响其余提供商的展示
