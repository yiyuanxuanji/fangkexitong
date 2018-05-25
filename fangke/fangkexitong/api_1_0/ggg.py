# coding=utf-8
# 导入蓝图对象
from . import api
# 导入flask内置的对象
from flask import  jsonify, request
from fangkexitong import db
# 导入自定义状态码
from fangkexitong.utils.response_code import RET
# 导入模型类
from fangkexitong.models import Yanzheng
# 导入json模块
import json, re
# 导入日期模块
import datetime

# @api.route('/users/visitors', methods=['GET'])
# def postg_visitors():
#     """
#       访客登记,需求受邀人的open_id,  邀请函id
#     :return:
#       """
#     carry_data = request.form()
#     # 检查参数的存在
#     if not carry_data:
#         return jsonify(success=RET.WRONG, data='携带访客数据录入失败')
#     # 获取详细的参数信息
#     open_id = carry_data.get('open_id')   # 其实就是open_id
#     invit_id = carry_data.get('invit_id')         # 对应邀请函的id
#     info_list = carry_data.get('data')
#     try:
#         invit = Invitation.query.filter_by(id=invit_id).first()
#     except Exception as e:
#         current_app.logger.error(e)
#         return jsonify(success=RET.WRONG, data='查询邀请函信息失败')
#     user_id = invit.user_id  # 用户名
#     user = Users.query.filter_by(username=user_id).first()
#     user_name = user.full_name
#     user_comp = user.compary
#     for i in range(0, len(info_list)):
#         # inperson_id = carry_data[i].get('open_id')
#         full_name = carry_data[i].get('full_name')
#         phone = carry_data[i].get('phone')
#         email = carry_data[i].get('email')
#         id_type = carry_data[i].get('id_type')
#         id_num = carry_data[i].get('id_num')
#         company = carry_data[i].get('company')
#         if not all([full_name, phone, email, id_num, id_type, company]):
#             return jsonify(success=RET.WRONG, data='数据不全')
#         try:
#             visitor = Visitors.query.filter_by(full_name=full_name, phone=phone).first()
#             if visitor is None:
#                 visitor = Visitors()
#                 visitor.full_name = full_name
#                 visitor.phone = phone
#                 visitor.email = email
#                 visitor.id_type = id_type
#                 visitor.id_num = id_num
#                 visitor.company = company
#                 visitor.inperson_id = open_id
#                 db.session.add(visitor)
#             visitor_id = visitor.id
#             personopen = PersonOpen()
#             personopen.inperson_id = open_id
#             personopen.invit_id = invit_id
#             personopen.inperson_name = full_name
#             personopen.user_id = user_id
#             personopen.user_name = user_name
#             personopen.user_comp = user_comp
#             personopen.visitor_id = visitor_id
#             db.session.add(personopen)
#         except Exception as e:
#             current_app.logger.error(e)
#             return jsonify(success=RET.WRONG, data='查询用户信息失败')
#     db.session.commit()
#     return jsonify(success=RET.OK, data="保存成功")


@api.route('/users/yanzheng', methods=['GET'])
def postg_visitors():
    """
      需求受邀人的open_id,  邀请函id
    :return:

      """
    info_data = request.args.get("info_data")
    open_id = request.args.get("open_id")
    data = Yanzheng.query.filter_by(info_data=info_data,open_id=open_id).first()
    if data is None:
        return jsonify(success=RET.WRONG, data="对不起,你没有权限")
    # data_re = {"success":1,"data":data.info}
    # data_res = json.dumps(data_re)
    # return data_res
    return jsonify(success=RET.OK, data=eval(data.info))
