import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/todoList',
    method: 'post',
    data
  })
}

export function del(id) {
  return request({
    url: 'api/todoList/' + id,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/todoList',
    method: 'put',
    data
  })
}
