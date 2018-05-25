# -*- coding:utf-8 -*-

from datetime import datetime
from fangkexitong import db
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.ext.declarative import declarative_base
import time
# 链接数据库('数据库类型+数据库驱动名称://用户名:口令@机器地址:端口号/数据库名')
engine = db.create_engine("mssql+pymssql://visitor:12345678@cnspec.myds.me:61433/visitor", encoding='utf-8', echo=True)   # 数据库
Base = declarative_base()   # 生成SQLORM基类
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))

Base.query = db_session.query_property()


class BaseModel(object):
    """模型基类，为每个模型补充创建时间与更新时间"""
    create_time = db.Column(db.DateTime, default=datetime.now)  # 记录的创建时间
    update_time = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)  # 记录的更新时间


class Users(BaseModel, db.Model):
    """ 用户表"""
    __tablename__ = "fk_users"

    id = db.Column(db.Integer, primary_key=True)  # 编号
    username = db.Column(db.String(100), unique=True, nullable=False)  # 用户名
    password = db.Column(db.String(100), nullable=False)  # 密码
    full_name = db.Column(db.String(100), nullable=False)  # 姓名
    phone = db.Column(db.String(100), nullable=False)  # 手机号
    company = db.Column(db.String(100), nullable=False)  # 公司的名称

    # # 通过装饰器property，把password方法提升为属性
    # @property
    # def password(self):
    #     """获取password属性时被调用"""
    #     raise AttributeError("不可读")
    #
    # @password.setter
    # def password(self, passwd):
    #     """设置password属性时被调用，设置密码加密"""
    #     self.password_hash = generate_password_hash(passwd)
    #
    # def check_password(self, passwd):
    #     """检查密码的正确性"""
    #     return check_password_hash(self.password_hash, passwd)


class Invitation(BaseModel, db.Model):
    """邀请函的信息"""

    __tablename__ = "fk_invitation"

    id = db.Column(db.Integer, primary_key=True)  # 邀请函编号
    full_name = db.Column(db.String(100), nullable=True)  # 用户姓名
    phone = db.Column(db.Integer, nullable=False)  # 手机号
    visitor_count = db.Column(db.Integer, nullable=True)  # 来访的人数
    visit_time = db.Column(db.String(100), nullable=False)  # 来访的时间
    leave_data = db.Column(db.String(100), nullable=True)  # 离开的时间
    position = db.Column(db.String(320),  nullable=False)  # 来访的地址
    reason = db.Column(db.String(1000),  nullable=False)  # 来访的事由
    image_url = db.Column(db.String(2560), nullable=True)  # 图片的地址url
    check_in = db.Column(db.String(100),  nullable=True)  # 访问的楼层
    user_id = db.Column(db.String(100), nullable=False)  # 租户的id(用户名)
    state = db.Column(db.String(100),  nullable=False)  # 邀请函的状态
    flag = db.Column(db.Boolean,  default=True)  # 邀请函的群发和个人
    info_data = db.Column(db.String(100), nullable=True)  # 标识
    # invit_person = db.relationship("PersonOpen", backref="invitation")  # 受邀人的外键
    # visit_time = time.mktime(visit_time)
    user_fullname = db.Column(db.String(100), nullable=True)  # 租用户名字
    user_phone = db.Column(db.String(100), nullable=True)  # 租户用手机



    def inviting_object(self):
        """访客邀请列表"""
        invit_object = {
            "id": self.id,
            "user_id": self.user_id,
            "full_name": self.full_name,
            "visit_time": self.visit_time,
            "state": self.state
        }
        return invit_object

    def inviting_infomation(self):
        """访客邀请的数据"""
        invit_info = {
            "id": self.id,
            "visit_time": self.visit_time,
            "position": self.position,
            "full_name": self.full_name,
            "visitor_count": self.visitor_count,
            "reason": self.reason,
            # "image_url": self.image_url
            "phone": self.phone,
            "check_in": self.check_in,
            "info_data":self.info_data
        }
        return invit_info


class InvitingPerson(BaseModel, db.Model):
    """受邀人的信息"""

    __tablename__ = "fk_invit_person"

    id = db.Column(db.Integer, primary_key=True)  # 受邀人编号
    open_id = db.Column(db.String(100), nullable=False)  # 受邀人的open_id
    full_name = db.Column(db.String(100), nullable=False)  # 用户姓名
    phone = db.Column(db.String(100), nullable=False)  # 手机号
    email = db.Column(db.String(100),  nullable=False)  # 邮箱
    # certificates = db.Column(db.Enum("身份证", "军官证"), default="身份证")  # 证件的类型
    id_type = db.Column(db.String(100), nullable=False)  # 证件的类型
    id_num = db.Column(db.String(100),  nullable=False)  # 身份证号码
    company = db.Column(db.String(100),  nullable=False)  # 公司的名称
    # peropen = db.relationship("PersonOpen", backref="invit_person")  # 受邀人和租户的关系外键
    # visitor_id = db.relationship("Visitors", backref="invit_person")    # 受访人的外键
    # applicant_id = db.relationship("Applicant", backref="invit_person")  # 申请人的外键


    def inviting_info(self):
        info_mation = {
            "full_name": self.full_name,
            "phone": self.phone,
            "email": self.email,
            "id_type": self.id_type,
            "id_num": self.id_num,
            "company": self.company
        }
        return info_mation


class PersonOpen(BaseModel, db.Model):
    """受邀人和租户的关系"""

    __tablename__ = "fk_invit_open"

    id = db.Column(db.Integer, primary_key=True)  # 主键
    inperson_id = db.Column(db.String(100), nullable=False)  # 关联的受邀人的open_id
    inperson_name = db.Column(db.String(100), nullable=False)  # 受邀人的名字
    invit_id = db.Column(db.String(100), nullable=False)  # 关联的邀请函的id
    user_id = db.Column(db.String(100), nullable=False)  # 租户的用户名
    user_name = db.Column(db.String(100), nullable=False)  # 关联的租户的名字
    user_comp = db.Column(db.String(100), nullable=False)  # 关联的租户的公司
    visitor_id = db.Column(db.String(100), nullable=True)  # 关联的受访人的信息
    delete = db.Column(db.Boolean,  default=False)    # 是否显示


class Visitors(BaseModel, db.Model):
    """受访人的信息"""

    __tablename__ = "fk_visitor"

    id = db.Column(db.Integer, primary_key=True)  # 受访人人编号
    full_name = db.Column(db.String(100), nullable=False)  # 用户姓名
    phone = db.Column(db.String(100), nullable=False)  # 手机号
    email = db.Column(db.String(100), unique=True, nullable=False)  # 邮箱
    id_type = db.Column(db.String(100), nullable=True)  # 证件的类型
    id_num = db.Column(db.String(100), unique=True, nullable=False)  # 身份证号码
    company = db.Column(db.String(100),  nullable=False)  # 公司的名称
    # inperson_id = db.Column(db.Integer, db.ForeignKey("fk_invit_person.id"))  # 关联的受邀人的id

    def visitor_info(self):
        info_mation = {

            "full_name": self.full_name,
            "phone": self.phone,
            "email": self.email,
            "id_type": self.id_type,
            "id_num": self.id_num,
            "company": self.company
        }
        return info_mation


class Applicant(BaseModel, db.Model):
    """申请人的信息"""

    __tablename__ = "fk_applicant"

    id = db.Column(db.Integer, primary_key=True)  # 主键
    full_name = db.Column(db.String(100),  nullable=False)  # 申请人的名字
    phone = db.Column(db.String(100),  nullable=False)   # 申请人的电话
    ap_company = db.Column(db.String(100),  nullable=False)  # 申请人的公司的名称
    company = db.Column(db.String(100),  nullable=False)  # 要去拜访的公司的名称
    invit_name = db.Column(db.String(100),  nullable=False)  # 要拜访的用户姓名
    reason = db.Column(db.String(200), nullable=False)  # 拜访的事由
    visit_time = db.Column(db.String(100),  nullable=False)  # 拜访的时间
    leave_data = db.Column(db.String(100), nullable=True)  # 拜访离开的时间
    user_id = db.Column(db.String(100),  nullable=False)  # 租户的id(可以通过PersonOpen查询)
    state = db.Column(db.String(100), nullable=False)  # 申请人的状态

    def inviting_object(self):
        """访客邀请列表"""
        invit_object = {
            "id": self.id,
            "full_name": self.full_name,
            "visit_time": self.visit_time,
            "state": self.state
        }
        return invit_object

    def examine(self):
        """访客审核页面的数据"""
        audit_information = {
            "id": self.id,
            "full_name": self.full_name,
            "phone": self.phone,
            "visit_time": self.visit_time,
            "leave_data": self.visit_time,
            "reason": self.reason,
            "invit_name": self.invit_name,
            "company": self.company,
            "state": self.state
        }
        return audit_information


class Yanzheng(BaseModel, db.Model):
    """验证"""

    __tablename__ = "fk_yanzheng"

    id = db.Column(db.Integer, primary_key=True)  # 主键
    info_data = db.Column(db.String(100), nullable=False)  # 标识
    info = db.Column(db.String(1000), nullable=False)  # 内容
    open_id = db.Column(db.String(100), nullable=False)  # 打开人的id





if __name__ == '__main__':
    Base.metadata.create_all(engine)