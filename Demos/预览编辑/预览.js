new Vue({
    el:'#show',
    data(){
        return{
            again:false,
            // 从编辑页面传过来的formData，项目中在created里面赋值
            formData:
            {"id":0,"title":"问卷标题","questions":[{"show":true,"id":1,"type":0,"title":"题目","err":false,"must":false,"rela":{"question_id":null,"option_index":[]},"options":[{"content":"选项","to":[4,4]},{"content":"选项","to":[]},{"content":"选项","to":[]},{"content":"选项","to":[]},{"content":"选项","to":[]}],"ans":null},{"show":true,"id":2,"type":1,"title":"题目","err":false,"must":false,"rela":{"question_id":null,"option_index":[]},"min":2,"max":2,"options":[{"content":"选项"},{"content":"选项"},{"content":"选项"}],"ans":[]},{"show":true,"id":3,"type":2,"title":"题目","err":false,"must":true,"rela":{"question_id":null,"option_index":[]},"content":""},{"show":true,"id":4,"type":1,"title":"题目","err":false,"must":false,"rela":{"question_id":null,"option_index":[]},"min":2,"max":2,"options":[{"content":"选项"},{"content":"选项"},{"content":"选项"},{"content":"选项"}],"ans":[]},{"show":false,"id":5,"type":0,"title":"题目","err":false,"must":false,"rela":{"question_id":1,"option_index":[0]},"options":[{"content":"选项","to":[]},{"content":"选项","to":[]},{"content":"选项","to":[]}],"ans":null}]}
            ,
        }
    },
    computed:{
        
        // 单选必答题提示
        singleWaring:function(questionq){
            return function(question){
                if(this.again)
                {
                    if(question.show&&question.must&&question.ans==null)
                    {
                        question.err=true;
                        return "本题必答";
                    }
                    question.err=false;
                }
                return ;
            }
        },
        // 多选题所选选项数目限制提示
        multWaring:function(question){
            return function(question){
                if(this.again)// 当提交后才提示
                {
                    if(question.show&&question.must||question.ans.length>0)// 如果多选要求你必填，或已经选择了选项
                    {
                        if(question.ans.length<question.min||question.ans.length>question.max)
                        {
                            question.err=true;
                            if(question.min<question.max)
                            {
                                return "请选择"+question.min+"到"+question.max+"个选项";
                            }else{
                                return "请选择"+question.min+"个选项";
                            }
                        }
                    }
                    question.err=false;
                }
                return ;
            }
        },
        // 填空题必填提示
        blankWarning:function(question){
            return function(question){
                if(this.again)
                {
                    if(question.show&&question.must&&question.content=="")
                    {
                        question.err=true;
                        return "此题必答";
                    }
                }
                return;
            }
        },
        fun(){
            return ;
        }
    },
    methods:{
        // 显示被关联题目
        rela(i_q)
        {
            val = this.formData.questions[i_q];
            // 如果题目有关联
            for(var i=0;i<val.options[val.ans].to.length;i++)
            {
                this.formData.questions[val.options[val.ans].to[i]].show=true;
            }
            if(val.options[val.ans].to.length==0)
            {
                // 隐藏其他选项关联的题目
                for(var j=0;j<val.options.length;j++)
                {
                    for(var i=0;i<val.options[j].to.length;i++)
                    {
                        this.formData.questions[val.options[j].to[i]].show=false;
                    }
                }
            }
        },
        // 提交问卷，对填写内容进行校验
        onSubmit()
        {
            this.again=true;// 显示要求
            for(var i=0;i<this.formData.questions.length;i++)// 遍历数据
            {
                if(this.formData.questions[i].err)
                {
                    alert("请按要求填写问卷");
                    return;
                }
            }
            alert("提交成功");
            return;
        }
    },
    // 对传过来的formData数据进行处理，并覆盖原来的formData
    created(){
        // 解析提交的JSON数据
        // var array = this.formData;// 返回的结果,to是跳转问题的index
        // for(var i=0;i<array.questions.length;i++)// 遍历formData
        // {
        //     if(array.questions[i].rela.option_index.length>0)// 找到被关联题目下标i
        //     {
        //         console.log(array.questions[i].rela.option_index.length)
        //         array.questions[i].show=false;// 隐藏被关联问题
        //         for(var j=0;j<i;j++)// 在被关联题目前面寻找关联题目
        //         {
        //             if(array.questions[j].id==array.questions[i].rela.question_id)// 找到关联题目的下标j
        //             {
        //                 for(var k=0;k<array.questions[i].rela.option_index.length;k++)// 被关联题目option_index的下标k
        //                 {
        //                     array.questions[j].options[array.questions[i].rela.option_index[k]].to.push(i);
        //                 }
        //                 break;// 找到之后可以直接处理下一题
        //             }
        //         }
        //     }
        //     else{
        //         array.questions[i].show=true;
        //     }
        //     // 在formatData里添加ans，记录选择题的答案（所选选项的下标）
        //     if(array.questions[i].type==0)// 如果是单选题
        //     {
        //         array.questions[i].ans=null;
        //     }
        //     else if(array.questions[i].type==1)//如果是多选题
        //     {
        //         array.questions[i].ans=[];
        //     }
        // }
        // this.formData = array;
    }
});
