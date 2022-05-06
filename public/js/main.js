window.pageData = {};

const page = [
    {
        path: "/",
        name: "首頁",
        id: "home",
    },
    {
        path: "/404",
        name: "找不到頁面",
        id: "404",
    },
    {
        path: "/profile",
        name: "個人資料",
        id: "profile"
    },
    {
        path: "/availableScore",
        name: "已公告成績",
        id: "availableScore"
    },
    {
        path: "/score",
        name: "成績查詢",
        id: "score"
    },
    {
        path: "/compare",
        name: "成績比較",
        id: "compare"
    },
    {
        path: "/lack",
        name: "缺曠紀錄",
        id: "lack"
    },
    {
        path: "/rewandpun",
        name: "獎懲紀錄",
        id: "rewandpun"
    }
]

function changePathName(name) {
    if (history.length > 1 && window.history.state !== null && location.pathname !== "/") name = "<a href='#' onclick='history.back();'><返回</a> " + name;
    document.querySelector("#pathName").innerHTML = name;
}

function createTaskBox() {
    // Create a progressing task box
    var taskBox = document.createElement("div");
    taskBox.classList.add("taskBox");
    taskBox.id = "taskBox";
    taskBox.innerHTML = `
        <div class="tskbx">
            <div class="taskBoxTitle">
                <h1>資料處理中...</h1>
            </div>
            <div class="taskBoxTasks"></div>
        </div>
    `;
    document.body.appendChild(taskBox);
    return taskBox;
}

function addTaskList(name) {
    var taskBox = document.querySelector("#taskBox");
    if (!taskBox) taskBox = createTaskBox();
    var taskList = taskBox.querySelector(".taskBoxTasks");

    var taskID = Math.floor(Math.random() * 10000);

    var task = document.createElement("div");
    task.classList.add("task");
    task.setAttribute("data-task", taskID);
    task.innerHTML = `
        <div class="taskStatus">
            <span class="icon"><i class="fa-solid fa-spinner"></i></span>
        </div>
        <span class="taskName">${name}</span>
    `;
    taskList.appendChild(task);
    return taskID;
};

function setTaskStatus(taskID, status) {
    var task = document.querySelector(`[data-task="${taskID}"]`);
    if (!task) return;
    var taskStatus = task.querySelector(".taskStatus");
    if (!taskStatus) return;
    var icon = taskStatus.querySelector(".icon");

    if (status === "success") {
        icon.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
    } else if (status === "fail") {
        icon.innerHTML = `<i class="fa-solid fa-circle-xmark"></i>`;
    } else if (status === "progress") {
        icon.innerHTML = `<i class="fa-solid fa-spinner"></i>`;
    }
}

function finishTask() {
    var taskBox = document.querySelector("#taskBox");
    if (!taskBox) return;
    taskBox.remove();
}

function loadPageScript(id) {
    if (page.find(e => e.id === id) === undefined) return;
    window.execute = () => { };
    fetch(`/js/page/${id}.js`).then(res => res.text()).then(res => {
        eval(res);
        window.execute();
    })
};

function loadPage(path, orgPath) {
    // if (path === orgPath) return;
    path = new URL("http://example.com" + path).pathname || location.pathname;

    if (!page.find(e => e.path === location.pathname)) path = "/404";

    var doc = document.querySelector("#mainContent");
    doc.innerHTML = "";
    changePathName("");
    window.pageData.function = {};
    window.pageData.data = {};

    changePathName(page.find(e => e.path === path).name);
    loadPageScript(page.find(e => e.path === path).id);
}

function goPage(path) {
    var orgPath = location.pathname;
    window.history.pushState({}, "", path);
    loadPage(path, orgPath);
}

document.addEventListener("click", event => {
    try {
        var ele = event.path.find(e => e.tagName.toLowerCase() === "a");
    } catch (err) {
        return;
    }
    if (ele) {
        event.preventDefault();
        var url = ele.href; 
        if (url === undefined || url === "" || url === null || url === location.href + "#") return;
        var urlObject = new URL(url);
        if (urlObject.host === window.location.host) {
            goPage(urlObject.pathname);
            return;
        }
        location.href = url;
    }
});

window.onload = () => {
    loadPage(location.pathname);
}

window.onpopstate = (event) => {
    // event.preventDefault();
    loadPage();
}

function inputStyle() {
    var inputs = document.getElementsByTagName("input");
    Array.from(inputs).forEach(e => {
        e.addEventListener("focusin", ev => {
            e.parentElement.classList.add("active");
        });

        e.addEventListener("focusout", ev => {
            if (e.value === "") {
                e.parentElement.classList.remove("active");
            }
        });
    });
}

document.addEventListener("DOMNodeInserted", (ev) => {
    inputStyle();
}, false);