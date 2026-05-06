export interface Parameter {
  name: string
  type: string
  required: boolean
  description: string
  in: 'path' | 'query' | 'header' | 'body'
}

export interface Response {
  statusCode: string
  description: string
  example: string
}

export interface ApiData {
  name: string
  method: string
  url: string
  description: string
  parameters: Parameter[]
  responses: Response[]
}

export const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
export const PARAM_TYPES = ['string', 'number', 'boolean', 'object', 'array']
