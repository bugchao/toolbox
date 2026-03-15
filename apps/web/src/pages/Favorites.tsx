import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Star } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import { getToolByPath } from '../config/tools'

const Favorites: React.FC = () => {
  const { t } = useTranslation('nav')
  const { t: tFav } = useTranslation('favorites')
  const { favorites, remove } = useFavorites()

  const tools = favorites
    .filter((path) => path !== '/' && path !== '/favorites')
    .map((path) => getToolByPath(path))
    .filter((t): t is NonNullable<typeof t> => t != null)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
        {tFav('title')}
      </h1>

      {tools.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">{tFav('empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <div
                key={tool.path}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={tool.path}
                    className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate block"
                  >
                    {t(tool.nameKey)}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-300 truncate">{tool.path}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => remove(tool.path)}
                    className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    title={tFav('removeFromFavorites')}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                  <Link
                    to={tool.path}
                    className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm"
                  >
                    {tFav('open')}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Favorites
