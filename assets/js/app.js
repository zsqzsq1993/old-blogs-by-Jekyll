/* newtodo */
function NewToDo(text) {
    this.text = text;
    this.active = true;
    this.id = undefined;
}
NewToDo.prototype = {
    constructor : NewToDo,
    counter : 0,
    createLi    : function(){
        let li     = document.createElement("li");
        let div    = document.createElement("div");
        let input  = document.createElement("input");
        let label  = document.createElement("label");
        let button = document.createElement("a");
        NewToDo.prototype.counter += 1;
        this.id  = this.counter;

        li.setAttribute("id",this.counter);
        button.setAttribute("href","#")
        div.setAttribute("class","view");
        input.setAttribute("class","toggle");
        input.setAttribute("type","checkbox");
        button.setAttribute("class","destory");

        button.innerText = "×"
        label.appendChild(document.createTextNode(this.text));
        div.appendChild(input);
        div.appendChild(label);
        div.appendChild(button);
        li.appendChild(div);

        return li;
    },

    deletes : function(){
        let li = $("li#"+this.id);
        li.remove();
    },

    showCross : function () {
        let li     = $("li#"+this.id);
        let button = $("li#"+this.id+" .destory");
        li.mouseenter(function () {
            button.show();
        });
        li.mouseleave(function () {
            button.hide();
        });
        button.mouseenter(function () {
            button.css("color","#af5b5e");
        })
        button.mouseleave(function () {
            button.css("color","#cc9a9a");
        })
    },

    toggle:function (label) {
        if (this.active){
            label.css({
                "text-decoration":"line-through",
                "color":"#e6e6e6"});
            this.active = false;
        }else {
            label.css({
                "text-decoration": "none",
                "color": "#4d4d4d"});
            this.active = true;
        }
    },

    showAll: function () {
        let li     = $("li#"+this.id);
        li.show();
    },

    showActive: function () {
        let li     = $("li#"+this.id);
        if (this.active)
            li.show();
        else
            li.hide();
    },

    showCompleted: function () {
        let li     = $("li#"+this.id);
        if (!this.active)
            li.show();
        else
            li.hide();
    },

    editting : function () {
        let label  = $("#"+this.id+" .view label");
        let txt   = label.text();
        if (!txt) return;
        let input  = "<input type='text' value=''>";
        label.text("");
        label.append(input);
        let inputs = $("#"+this.id+" .view label input");
        inputs.focus();
        inputs.attr('value',txt);
        inputs.attr("class", "edit");
        inputs.keyup(function (event) {
            if (event.which === 13){
                let text = inputs.val();
                if (text !== ""){
                    label.empty();
                    label.text(text);
                }
                event.stopPropagation();
            }

        });

    }


}
/* storage */
function Storage() {
    this.all_active = 0;
    this.all_completed = 0;
    this.all = 0;
    this.list = [];

    this.count = function () {
        let left = this.list.filter(function (todo) {
            if(todo.active) return todo;
        });
        $(".count").text(left.length);
    }

    this.delets   = function (todo) {
        let that = this;
        let button = document.getElementById(todo.id).getElementsByClassName("destory")[0];

        button.onclick = function (event) {
            event.cancelable = true;
            event.preventDefault();
            todo.deletes();
            let index = that.list.indexOf(todo);
            that.list.splice(index,1);
            that.count();
        };
    }

    this.toggle = function (todo) {
        let button = $("li#"+todo.id+" .toggle");
        let label   = $("li#"+todo.id+" label");
        let that = this;
        button.click(function (){
            todo.toggle(label);
            that.count();
        });

    }

    this.toggleAll = function () {
        let button = $("#toggle-all");
        let that = this;
        button.click(function () {
            if(button.is(":checked")){
                $(".toggle").prop("checked",true);
                that.list.forEach(function (element) {
                    element.active = true;
                    element.toggle($("li#"+element.id+" label"));
                });
            }else {
                $(".toggle").prop("checked",false);
                that.list.forEach(function (element) {
                    element.active = false;
                    element.toggle($("li#"+element.id+" label"));
                });
            }
            that.count();
        });
    }

    this.edit = function (todo) {
        let button = $("#"+todo.id+" .view label");
        button.dblclick(function (e) {
            e.stopPropagation();
            todo.editting();
        })

    }

    this.status = function () {
        let filter = document.getElementsByClassName("filters")[0];
        let statuss = filter.getElementsByTagName("a");
        let all = statuss[0];
        let active = statuss[1];
        let complete = statuss[2];
        let that = this;
        function loop(command){
            for (let i=0; i<that.list.length; i++){
                let todo = that.list[i];
                if (command === "all") todo.showAll();
                else if (command === "active") todo.showActive();
                else if (command === "complete") todo.showCompleted();
            }
        }

        all.onclick = function (event) {
            event.cancelable = true;
            event.preventDefault();
            all.className = "selected";
            active.className = "";
            complete.className = "";
            loop("all");
        };
        active.onclick = function (event) {
            event.cancelable = true;
            event.preventDefault();
            all.className = "";
            active.className = "selected";
            complete.className = "";
            loop("active");
        };
        complete.onclick =function (event) {
            event.cancelable = true;
            event.preventDefault();
            all.className = "";
            active.className = "";
            complete.className = "selected";
            loop("complete");
        };

    }

    this.clearAll = function () {
        let button = document.getElementsByClassName("clear-complete")[0];
        let that = this;
        button.onclick = function () {
            for(let i=0; i<that.list.length; i++){
                let todo = that.list[i];
                if (!todo.active) todo.deletes();
            }
        }
    }


    this.listener = function (todo) {
        todo.showCross();
        this.delets(todo);
        this.toggle(todo);
        this.edit(todo);
    }

    this.pipLine = function () {
        let input = document.getElementsByClassName("new-todo")[0];
        let list = document.getElementsByClassName("todo-list")[0];
        let text;
        let that = this;
        let todo ;
        input.onkeydown = function (event) {
            if (event.code === "Enter") {
                text = input.value;
                input.value = "";
                if (!text) return;
                todo = new NewToDo(text);
                list.appendChild(todo.createLi());
                that.list.push(todo);
                that.count();
                //Listener
                that.listener(todo);
            }
        }
    };

}
function flow(){
    let storage = new Storage();
    storage.pipLine();
    storage.status();
    storage.clearAll();
    storage.toggleAll();
}
window.onload = flow;
