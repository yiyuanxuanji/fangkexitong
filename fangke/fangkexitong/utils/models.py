# -*- coding:utf-8 -*-

from datetime import datetime
from . import constants
from . import db


class BaseModel(object):
    """模型基类，为每个模型补充创建时间与更新时间"""

    create_time = db.Column(db.DateTime, default=datetime.now)  # 记录的创建时间
    update_time = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)  # 记录的更新时间


class Invitation(BaseModel, db.Model):
    """邀请函的信息"""

    __tablename__ = "fk_invitation"

    id = db.Column(db.Integer, primary_key=True)  # 邀请函编号
    name = db.Column(db.String(32), unique=True, nullable=False)  # 用户姓名
    mobile = db.Column(db.String(11), unique=True, nullable=False)  # 手机号
    numpeople = db.Column(db.String(2), nullable=False)  # 来访的人数
    come_date = db.Column(db.Date, nullable=False)  # 来访的时间
    leave_data = db.Column(db.Date, nullable=False)  # 离开的时间
    address = db.Column(db.String(32),  nullable=False)  # 来访的地址
    story = db.Column(db.String(100),  nullable=False)  # 来访的事由
    image_url = db.Column(db.String(256), nullable=True)  # 图片的地址url
    open_id = db.Column(db.String(32), nullable=False)  # 租户的id(用户名)
    state = db.Column(db.String(32),  nullable=False)  # 邀请函的状态
    flag = db.Column(db.Boolean,  nullable=True)  # 邀请函的群发和个人
    invit_person = db.relationship("PersonOpen", backref="invitation")  # 受邀人的外键


class InvitingPerson(BaseModel, db.Model):
    """受邀人的信息"""

    __tablename__ = "fk_invit_person"

    id = db.Column(db.Integer, primary_key=True)  # 受邀人编号
    name = db.Column(db.String(32), unique=True, nullable=False)  # 用户姓名
    mobile = db.Column(db.String(11), unique=True, nullable=False)  # 手机号
    mail = db.Column(db.String(64), unique=True, nullable=False)  # 邮箱
    # certificates = db.Column(db.Enum("身份证", "军官证"), default="身份证")  # 证件的类型
    certificates = db.Column(db.String(32), nullable=False)  # 证件的类型
    certi_num = db.Column(db.String(20), unique=True, nullable=False)  # 身份证号码
    company = db.Column(db.String(32),  nullable=False)  # 公司的名称
    peropen = db.relationship("PersonOpen", backref="invit_person")  # 受邀人和租户的关系外键
    visitor_id = db.relationship("Visitors", backref="invit_person")    # 受访人的外键
    applicant_id = db.relationship("Applicant", backref="invit_person")  # 申请人的外键


class PersonOpen(BaseModel, db.Model):
    """受邀人和租户的关系"""

    __tablename__ = "fk_invit_person"

    id = db.Column(db.Integer, primary_key=True)  # 主键
    inperson_id = db.Column(db.Integer, db.ForeignKey("fk_invit_person.id"), nullable=False)  # 关联的受邀人的id

    invite_id = db.Column(db.Integer, db.ForeignKey("fk_invitation.id"), nullable=False)  # 关联的邀请函的id

    inperson_name = db.Column(db.Integer, db.ForeignKey("fk_invit_person.name"), nullable=False)  # 受邀人的名字
    open_id = db.Column(db.Integer, db.ForeignKey("fk_invit_person.open_id"), nullable=False)  # 租户的id
    open_name = db.Column(db.String(32), nullable=False)  # 关联的租户的名字
    open_comp = db.Column(db.String(32), nullable=False)  # 关联的租户的公司



class Visitors(BaseModel, db.Model):
    """受访人的信息"""

    __tablename__ = "fk_visitor"

    id = db.Column(db.Integer, primary_key=True)  # 受访人人编号
    name = db.Column(db.String(32), unique=True, nullable=False)  # 用户姓名
    mobile = db.Column(db.String(11), unique=True, nullable=False)  # 手机号
    mail = db.Column(db.String(64), unique=True, nullable=False)  # 邮箱
    certificates = db.Column(db.Enum("身份证", "军官证"), nullable=True)  # 证件的类型
    certi_num = db.Column(db.String(20), unique=True, nullable=False)  # 身份证号码
    company = db.Column(db.String(32),  nullable=False)  # 公司的名称
    inperson_id = db.Column(db.Integer, db.ForeignKey("fk_invit_person.id"), nullable=False)  # 关联的受邀人的id


class Applicant(BaseModel, db.Model):
    """申请人的信息"""

    __tablename__ = "fk_applicant"

    id = db.Column(db.Integer, primary_key=True)  # 申请人编号
    company = db.Column(db.String(32),  nullable=False)  # 要去拜访的公司的名称
    name = db.Column(db.String(32),  nullable=False)  # 要拜访的用户姓名
    story = db.Column(db.String(100), nullable=False)  # 拜访的事由
    come_date = db.Column(db.Date,  nullable=False)  # 拜访的时间
    leave_data = db.Column(db.Date, nullable=False)  # 拜访离开的时间
    open_id = db.Column(db.String(32),  nullable=False)  # 租户的id(可以通过PersonOpen查询)
    state = db.Column(db.String(32), nullable=False)  # 申请人的状态