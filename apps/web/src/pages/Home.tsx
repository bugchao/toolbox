import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@toolbox/ui-kit'
import { TOOLS, getToolTitle, getToolDescription } from '../config/tools'

const TOOL_ICONS: Record<string, string> = {
  'tools.qrcode_generate': '📱',
  'tools.qrcode_read': '🔍',
  'tools.qrcode_beautifier': '✨',
  'tools.news': '📰',
  'tools.zipcode': '📮',
  'tools.weather': '🌤️',
  'tools.github_info': '🐙',
  'tools.ip_query': '🌐',
  'tools.ip_asn': '🔢',
  'tools.dns_query': '🔌',
  'tools.dns_trace': '🔍',
  'tools.dns_propagation': '🌍',
  'tools.dns_global_check': '🌏',
  'tools.dnssec_check': '🔐',
  'tools.dns_performance': '⚡',
  'tools.dns_ttl': '⏱️',
  'tools.dns_soa': '📋',
  'tools.dns_diagnose': '🩺',
  'tools.dns_pollution_check': '☣️',
  'tools.dns_hijack_check': '🚨',
  'tools.dns_cache_check': '💾',
  'tools.dns_loop_check': '🔄',
  'tools.dns_ns': '🖥️',
  'tools.dns_cname_chain': '🔗',
  'tools.dns_nxdomain': '❌',
  'tools.domain_mx': '📧',
  'tools.domain_txt': '📄',
  'tools.domain_spf': '🛡️',
  'tools.domain_dkim': '🔑',
  'tools.domain_dmarc': '📮',
  'tools.domain_ttl_advice': '⏱️',
  'tools.domain_ns_check': '🛰️',
  'tools.domain_subdomain_scan': '🧪',
  'tools.domain_wildcard': '🪄',
  'tools.domain_health_score': '💯',
  'tools.ip_geo': '🗺️',
  'tools.ip_ptr': '🧷',
  'tools.ip_v4_to_v6': '🔁',
  'tools.ip_binary_hex': '🧮',
  'tools.ip_class': '🏷️',
  'tools.ip_public': '☁️',
  'tools.ip_cdn_check': '🌐',
  'tools.ip_blacklist': '🚫',
  'tools.security_ip_score': '🛡️',
  'tools.security_domain_blacklist': '🚫',
  'tools.security_port_scan': '📡',
  'tools.security_dns_vuln': '🧭',
  'tools.security_report_gen': '📑',
  'tools.ipam_plan': '🗺️',
  'tools.ipam_inventory': '🧱',
  'tools.ipam_usage': '📈',
  'tools.ipam_conflict': '⚠️',
  'tools.ipam_allocation_sim': '🎯',
  'tools.cidr_calculator': '📐',
  'tools.subnet_divide': '🧩',
  'tools.subnet_network_addr': '🧭',
  'tools.subnet_broadcast': '📣',
  'tools.subnet_mask': '🥽',
  'tools.ip_range': '↔️',
  'tools.subnet_capacity': '📦',
  'tools.ipv6_cidr': '🧬',
  'tools.vlsm': '🗂️',
  'tools.network_planner': '🗺️',
  'tools.json': '📋',
  'tools.base64': '🔢',
  'tools.timestamp': '⏰',
  'tools.url': '🔗',
  'tools.regex': '🔍',
  'tools.cron': '📅',
  'tools.password': '🔑',
  'tools.hash': '#️⃣',
  'tools.code': '💄',
  'tools.uuid': '🆔',
  'tools.text_comparator': '🔄',
  'tools.image_compressor': '📷',
  'tools.image_bg_remover': '✂️',
  'tools.markdown': '📝',
  'tools.bmi': '❤️',
  'tools.color_picker': '🎨',
  'tools.unit_converter': '📏',
  'tools.pdf_tools': '📄',
  'tools.sheet_editor': '📊',
  'tools.short_link': '🔗',
  'tools.resume': '📄',
  'tools.color_generator': '🎨',
  'tools.meme_generator': '😂',
  'tools.copywriting_generator': '✍️',
  'tools.wooden_fish': '🪵',
  'tools.life_progress': '⏳',
  'tools.format_converter': '🧩',
  'tools.meeting_minutes': '🗒️',
  'tools.ui_generator': '🪄',
  'tools.ppt_generator': '📊',
}

const Home: React.FC = () => {
  const { t } = useTranslation('nav')
  const { t: tHome } = useTranslation('home')

  const toolsForHome = TOOLS.filter(
    (tool) => tool.path !== '/' && tool.path !== '/favorites' && tool.categoryKey
  )
  const categories = Array.from(new Set(toolsForHome.map((tool) => tool.categoryKey))) as string[]

  return (
    <div className="space-y-8">
      {/* 浅色模式：深蓝/深灰文字；深色模式：白字，与参考图一致 */}
      <div className="text-center text-slate-800 dark:text-gray-200">
        <h1 className="text-4xl font-bold mb-4">{tHome('welcomeTitle')}</h1>
        <p className="text-xl text-slate-600 dark:text-gray-300 mb-8">{tHome('welcomeSubtitle')}</p>
      </div>

      {categories.map((categoryKey) => (
        <div key={categoryKey}>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-200 mb-6">
            {t(`category_${categoryKey}`)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolsForHome
              .filter((tool) => tool.categoryKey === categoryKey)
              .map((tool) => {
                const icon = TOOL_ICONS[tool.nameKey] ?? '🛠️'
                return (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    className="block hover:transform hover:scale-105 transition-all duration-300 group"
                  >
                    <Card>
                    <div className="flex items-start">
                      <div className="text-4xl mr-4">{icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-black dark:text-gray-200 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {getToolTitle(tool, t)}
                        </h3>
                        <p className="text-black dark:text-gray-300/90 mb-4">
                          {getToolDescription(tool, t, tHome)}
                        </p>
                        <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium">
                          {tHome('useNow')}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                    </Card>
                  </Link>
                )
              })}
          </div>
        </div>
      ))}

      <Card className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6">
          {tHome('featureTitle')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-200">
              {tHome('feature1Title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300/90">{tHome('feature1Desc')}</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-200">
              {tHome('feature2Title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300/90">{tHome('feature2Desc')}</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-200">
              {tHome('feature3Title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300/90">{tHome('feature3Desc')}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Home
