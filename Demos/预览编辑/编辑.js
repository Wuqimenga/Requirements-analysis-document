/*
   A被B关联：A问题被关联到B问题的一个或多个选项
   A关联B：A问题的某个选项关联了B问题
*/
var questionId=0;// 一个自增的id号，每当增加题目会自增1，删除题目的id不再使用

new Vue({
    el:'#app',
    data(){
        return{
            dialogVisible:false,  // 弹窗不显示
            formData:{
               userId:0,
               isPublish:false,
                id:0,
                title:"问卷标题",
                questions:[]
            },
            rules:{
                title:[{required:true,message:'问卷标题不能为空',trigger:'blur'}],
                question_title:[{required:true,message:'题目不能为空',trigger:'blur'}],
                content:[{required:true,message:'选项不能为空',trigger:'blur'}]
            }
        }
    },
    methods:{
        // 提交数据前对独居进行处理，增加to和ans属性
        handleData(formData)
        {
            var array = formData;// 返回的结果,to是跳转问题的index
            for(var i=0;i<array.questions.length;i++)// 遍历formData
            {
                if(array.questions[i].rela.option_index.length>0)// 找到被关联题目下标i
                {
                    console.log(array.questions[i].rela.option_index.length)
                    array.questions[i].show=false;// 隐藏被关联问题
                    for(var j=0;j<i;j++)// 在被关联题目前面寻找关联题目
                    {
                        if(array.questions[j].id==array.questions[i].rela.question_id)// 找到关联题目的下标j
                        {
                            for(var k=0;k<array.questions[i].rela.option_index.length;k++)// 被关联题目option_index的下标k
                            {
                                array.questions[j].options[array.questions[i].rela.option_index[k]].to.push(i);
                                // var t= array.questions[j].options[array.questions[i].rela.option_index[k]].to;
                                // array.questions[j].options[array.questions[i].rela.option_index[k]].to = new Set(t);// 去除重复项
                            }
                            break;// 找到之后可以直接处理下一题
                        }
                    }
                }
                else{
                    array.questions[i].show=true;
                }
                // 在formatData里添加ans，记录选择题的答案（所选选项的下标）
                if(array.questions[i].type==0)// 如果是单选题
                {
                    array.questions[i].ans=null;
                }
                else if(array.questions[i].type==1)//如果是多选题
                {
                    array.questions[i].ans=[];
                }
            }
            return array;
        },
        // 提交json数据
        onSubmit(formData){
            this.handleData(formData);
            this.$refs['rulesForm1'].validate(valid => {
                if (valid) {
                    console.log("formData: "+JSON.stringify(formData));
                    console.log("处理过并传给预览或后端的数据："+JSON.stringify(this.handleData(formData)))
                } else {
                    console.log("error submit!!");
                    return false;
                }
            });
        },
        // 编辑面板的显示和隐藏
        show_edit_panel(i){
            this.formData.questions[i].show=!(this.formData.questions[i].show)
        },
        // 显示逻辑设置弹窗
        show_logic_dialog(i){
            if(i==0)
            {
                this.$message({
                    message:"第一题不能设置逻辑关联",
                    type:"warning"
                })
                return;
            };
            this.dialogVisible=true;
        }, 
        // 已知question的id获取question
        getQuestion(id){
            var array = this.formData.questions;
            for(var i=0;i<array.length;i++)
            {
                if(array[i].id==id)
                {
                    return array[i];
                }
            }
            return null;
        },
        // 根据问题id获取options
        getOptions(id)
        {
            var question = this.getQuestion(id);
            if(question)
            {
                return question.options;
            }
            return [];
        },
        // 获取目前题目前的所有单选题的id
        getRelatedQuestions(index)
        {
            var idList = [];
            var array = this.formData.questions;
            for(var i=0;i<index;i++)
            {
                if(array[i].type==0)// 如果是单选题
                {
                    idList.push(array[i]);
                    idList=Array.from(new Set(idList));
                    console.log(idList);
                }
            }
            return idList;
        },
        // 逻辑设置点击确定
        save_logic(question)
        {
            // 如果只设置题目没有设置选项，不保存设置
            if(question.rela.option_index.length==0)
            {
                question.rela.question_id=null;
            }
            this.dialogVisible=false;
        },
        // 清除题目关联
        delete_logic(question){
            question.rela.question_id=null;
            question.rela.option_index=[];
            this.dialogVisible=false;
        },
        // 增加题目
        add_question(type){
            var question={};
            question.show=false;
            question.id=++questionId;
            question.type=type;
            question.title='题目';
            question.err=false;
            question.must=false;
            question.rela={
                question_id:null,
                option_index:[]
            }
            if(type==0){// 单选题
                question.options=[
                    {
                        content:'选项',
                        to:[],
                    }
                ];
            }
            else if(type==1){// 多选题
                question.min=2;
                question.max=null;
                question.options=[
                    {
                        content:'选项'
                    }
                ];
            }else// 填空题
            {
                question.content=''
            }
            this.formData.questions.push(question);
        },
        // 删除题目
        del_question(i_q){
            var array = this.formData.questions;
            var id = array[i_q].id;
            //如果有关联，不能删除
            // 遍历后面的题目，看是否有被关联
            for(var i=i_q;i<array.length;i++)
            {
                if(array[i].rela.question_id==id)
                {
                    this.$message({
                        message:"题目关联"+i+"题，不能删除！",
                        type:"warning",
                    })
                    return;
                }
            }
            // 如果关联题目，要清除相关题目  
            this.formData.questions.splice(i_q,1);
        },
        // 上移题目
        question_moveUp(i_q){
            if(i_q>0)// 不是第一道题，可以上移
            {
                if(this.formData.questions[i_q].rela.question_id==this.formData.questions[i_q-1].id)
                {
                    this.$message({
                        message:"被上一题关联，不能移动！",
                        type:"warning",
                    })
                    return;
                }
                var t1 = this.formData.questions[i_q];
                var t2 = this.formData.questions[i_q-1];
                this.formData.questions.splice(i_q,1,t2);
                this.formData.questions.splice(i_q-1,1,t1);
            }
            
        },
        // 下移题目
        question_moveDown(i_q){
            if(i_q<this.formData.questions.length-1)// 不是最后一道题，可以下移
            {
                if(this.formData.questions[i_q+1].rela.question_id==this.formData.questions[i_q].id)
                {
                    this.$message({
                        message:"关联下一题，不能移动！",
                        type:"warning",
                    })
                    return;
                }
                var t1 = this.formData.questions[i_q];
                var t2 = this.formData.questions[i_q+1];
                this.formData.questions.splice(i_q,1,t2);
                this.formData.questions.splice(i_q+1,1,t1);
            }
        },
        // 题目移动到最前
        question_moveFirst(i_q){
            // 如果被关联，不能移动到最前
            if(this.formData.questions[i_q].rela.question_id!=null)
            {
                this.$message({
                    message:"被前面题目关联，不能移动到最前！",
                    type:"warning",
                })
                return;
            }
            var t = this.formData.questions[i_q];
            this.formData.questions.splice(i_q,1);
            this.formData.questions.unshift(t);
            
        },
        // 题目移动到最后
        question_moveLast(i_q){
            for(var i=i_q;i<this.formData.questions.length;i++)
            {
                if(this.formData.questions[i].rela.question_id==this.formData.questions[i_q].id)
                {
                    this.$message({
                        message:"关联后面的题目，不能移动到最后！",
                        type:"warning",
                    })
                    return;
                }
            }
            var t = this.formData.questions[i_q];
            this.formData.questions.splice(i_q,1);
            this.formData.questions.push(t);
        },
        // 增加选项
        add_option(i_q,i_o){
            var option={};
            option.content='选项';
            if(this.formData.questions[i_q].type==0)
            {
                option.to=[];
            }
            this.formData.questions[i_q].options.splice(i_o+1,0,option);
        },
        // 删除选项
        del_option(i_q,i_o){
            this.formData.questions[i_q].options.splice(i_o,1);
        },
        // 上移选项
        option_moveUp(i_q,i_o){
            if(i_o>0)
            {
                var t1=this.formData.questions[i_q].options[i_o];
                var t2=this.formData.questions[i_q].options[i_o-1];
                this.formData.questions[i_q].options.splice(i_o,1,t2);
                this.formData.questions[i_q].options.splice(i_o-1,1,t1);
            }
        },
        // 下移选项
        option_moveDown(i_q,i_o){
            if(i_o<this.formData.questions[i_q].options.length-1)
            {
                var t1=this.formData.questions[i_q].options[i_o];
                var t2=this.formData.questions[i_q].options[i_o+1];
                this.formData.questions[i_q].options.splice(i_o,1,t2);
                this.formData.questions[i_q].options.splice(i_o+1,1,t1);
            }
        }
    }
});
