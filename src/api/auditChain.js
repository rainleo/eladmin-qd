import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/auditChain',
    method: 'post',
    data
  })
}

export function del(id) {
  return request({
    url: 'api/auditChain/' + id,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/auditChain',
    method: 'put',
    data
  })
}

// 根据sorted和source查询所有审批人
export function getAuditUsers(params) {
  return request({
    url: 'api/auditChain/auditUserBySortedSource',
    method: 'get',
    params
  })
}