import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/accountingSubjects',
    method: 'post',
    data
  })
}

export function del(id) {
  return request({
    url: 'api/accountingSubjects/' + id,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/accountingSubjects',
    method: 'put',
    data
  })
}

// 获取所有的AccountingSubjects
export function getAccountingSubjects(params) {
  return request({
    url: 'api/accountingSubjects',
    method: 'get',
    params
  })
}
