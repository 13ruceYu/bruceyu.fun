---
title: iOS 数据存储概览
description: iOS 数据存储概览
date: 2025-07-04
---

我最近突发奇想，想做个超简单的 ToDo 应用——就两个功能：添加任务、勾选完成。

听起来再普通不过吧？

可当我真正打开 Xcode 想写点东西的时候，脑袋里却浮现了一个熟悉的问题：

“那我这些任务……要存哪里？”

是啊，总不能让用户每次打开 App 都重新输入任务吧。

在 iOS 里，数据存储方式可不是只有一个，而是像开盲盒一样，有好几种选项摆在你面前：

1. UserDefaults
2. 本地 JSON 文件（FileManager + Codable）
3. Core Data
4. SwiftData
5. SQLite
6. Realm

你可能会想：“这些我都听过一点，但……到底用哪个合适？”

别急，我做了个小实验：用同一个 ToDo App 的原型，分别实现了一遍上面几种存储方式，然后……踩了一些坑，收获了一些经验，现在来跟你慢慢聊聊。

首先我们创建一个界面，只需要一个输入框和一个 todo 列表。

```swift
import SwiftUI

struct ContentView: View {
    @State private var todoContent = ""
    
    struct Todo: Identifiable {
        let id = UUID()
        let content: String
        let createdAt: Date
        var isDone: Bool = false
    }
    
    @State private var todoList: [Todo] = []
    
//    init() {
//        let fakeTodos = (1...12).map {
//            Todo(content: "Fake Todo #\($0)", createdAt: Date())
//        }
//        _todoList = State(initialValue: fakeTodos)
//    }
    
    var body: some View {
        VStack() {
            List(){
                ForEach($todoList) { $item in
                    TodoRow(todo: $item)
                }
            }
            .padding(0)
            TextField("Type your todo...", text: $todoContent)
                .padding()
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.gray, lineWidth: 1)
                )
                .onSubmit {
                    addTodo()
                }
            Button("Add") {
                addTodo()
            }
            .disabled(todoContent.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            .padding(.top, 8)
        }
        .padding()
    }
    
    private func addTodo() {
        let trimmedContent = todoContent.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedContent.isEmpty else { return }
        let newTodo = Todo(content: trimmedContent, createdAt: Date())
        todoList.append(newTodo)
        todoContent = ""
    }
}

struct TodoRow: View {
    @Binding var todo: ContentView.Todo
    
    var body: some View {
        Button(action: {
            todo.isDone.toggle()
        }) {
            HStack(alignment: .top) {
                Image(systemName: todo.isDone ? "checkmark.square" : "square")
                VStack(alignment: .leading) {
                    Text(todo.content)
                    Text(todo.createdAt, style: .date)
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    ContentView()
}
```

## 1. UserDefaults

UserDefaults 类似 web 中的 local storage，存储简单键值对（key-value），简单、高效但功能有限。

### 简单数据存储

- Bool
- Int, Float, Double
- String
- Date
- URL
- Data
- Array, Dictionary(只能包含上面这些数据类型)

```swift
// add & change
UserDefaults.standard.set(true, forKey: "isFirstLaunch")
// get
let isFirstLaunch = UserDefaults.standard.bool(forKey: "isFirstLaunch")
// delete
UserDefaults.standard.removeObject(forKey: "isFirstLaunch")
```

### 复杂数据存储

除了上面提到的简单类型外，其他类型都需要手动转换为 Data 类型才能存储到 UserDefaults 中，最常用的方式就是 JSONEncoder 和 JSONDecoder。

```swift
// 给 Struct 添加 Codable 协议
Struct Todo: Codable {
 let id: UUID
 let content: String
 var isDone: Bool
}
var todoList: [Todo] = []
func saveTodoList(todos: [Todo]) {
 if let data = try? JSONEncoder().encode(todos) {
  UserDefaults.standard.set(data, forKey: "todoList")
 }
}
func loadTodoList() -> [Todo] {
 if let data = try? UserDefaults.standard.data(forKey: "todoList"),
 let todos = try? JSONDecoder().decode([Todo].self, from: data) {
  return todos
 }
 return []
}
```

UserDefaults 虽然很方便，但也存在缺点：

- 不支持查询/筛选，你得整个 array decode 出来再手动找
- 没有版本控制、迁移机制，数据结构一变容易崩
- 存太多会影响性能（不是为“大数据量”设计的）

如果你只是想保存个 “是否开启暗色模式” 这样的用户设置，那它超级适合！

但如果你真的要用它来保存几十上百个任务……那你真的很勇（别问我怎么知道的 😭）

## 2. FileManager + Codable

iOS 里最原始也最朴素的文件系统操作，就是 FileManager。配合 Swift 的 Codable，我们可以优雅地把对象写成 JSON 文件保存到沙盒里。

和 UserDefaults 相比，这种方法就可以把存到 UserDefaults 中数据变成了一个文件，存到系统中。

```swift
// 1. 确定存储位置
func getTodosFileURL() -> URL {
    FileManager.default
        .urls(for: .documentDirectory, in: .userDomainMask)[0]
        .appendingPathComponent("todos.json")
}
func saveTodos(_ todos: [Todo]) {
    do {
        let data = try JSONEncoder().encode(todos)
        let url = getTodosFileURL()
        try data.write(to: url)
    } catch {
        print("保存失败: \(error)")
    }
}
func loadTodos() -> [Todo] {
    let url = getTodosFileURL()
    if FileManager.default.fileExists(atPath: url.path),
       let data = try? Data(contentsOf: url),
       let todos = try? JSONDecoder().decode([Todo].self, from: data) {
        return todos
    } else {
        print("读取失败或文件不存在")
        return []
    }
}
```

就是这么简单，纯纯的“增删改查手动挡”。

🪛 优点

- 数据格式清晰、易调试（你甚至能用 Finder 找到那个 JSON）
- 没有黑盒，控制权完全在你手上
- Codable 写起来非常优雅

🤕 缺点

- 要自己处理文件不存在、数据同步等问题
- 并发读写容易出锅（建议加 DispatchQueue 或 actor）
- 缺乏“高级功能”：比如筛选、索引、关系模型等

💡适合谁？

如果你在做一个不太复杂的 App，比如一个离线备忘录、读书笔记，或者“任务草稿箱”，FileManager + Codable 是一个透明又可靠的选择。

但一旦数据结构复杂了、数据量上来了，你就会开始怀念那些 ORM 的好。

下一节我们就来看看 Apple 亲儿子——Core Data，一言不合就上数据模型、NSManagedObject、上下文和魔法同步。

## 3. Core Data

Core Data 是 Apple 提供的一套强大的本地数据持久化框架，它不仅是数据库（其实底层默认是 SQLite），还是一整套数据模型、对象关系映射、生命周期管理的解决方案。

😵 初看上去有点吓人

你会看到很多新名词：

- NSManagedObjectContext
- NSPersistentContainer
- FetchRequest
- Entity
- …

没错，它不像 UserDefaults 那样即拿即用，Core Data 更像是——

“你得先搭个棚子，把舞台布好，灯光音响调试完，再开始演戏。”

🏗 设置 Core Data 的流程

Xcode 很贴心地可以在建工程时勾选“Use Core Data”，会自动帮你配置 CoreDataStack。如果你是手动添加，大致流程是这样的：

### 1. 描述数据结构 - Model

当我们在学习和理解 Core Data 时，需要牢记 CoreData 本质上就是在使用底层的 SQLite。所以我们的第一步是要告诉 CoreData，我们想要创建一个怎样的数据，这就是 Data Model 的作用。

通过 cmd + n 创建一个 Core Data 的 Data Model 文件： `XxxModel.xcdatamodeld` 。

配置 Entity，比如 TodoItem，这个相当于是数据表。

### 2. 启动接入 Core Data - PersistenceController

```swift
import CoreData

struct PersistenceController {
    // 单例共享实例
    static let shared = PersistenceController()
    
    // Core Data 核心容器
    let container: NSPersistentContainer
    
    // 初始化（可选择是否为内存数据库）
    init(inMemory: Bool = false) {  
        container = NSPersistentContainer(name: "TodoModel") // 这里是 .xcdatamodeld 的名字
        
        // 如果是内存数据库，用于测试
        if inMemory {
            container.persistentStoreDescriptions.first!.url = URL(fileURLWithPath: "/dev/null")
        }
        
        // 加载数据库（失败直接崩溃，开发时可接受）
        container.loadPersistentStores { _, error in
            if let error = error {
                fatalError("加载 Core Data 失败: \(error)")
            }
        }
        
        // 自动合并来自其他上下文的更改（用于 SwiftUI 多线程支持）
        container.viewContext.automaticallyMergesChangesFromParent = true
        container.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
    }
    
    // 保存方法（仅在有变更时保存）
    func save() {
        let context = container.viewContext
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                print("保存失败: \(error.localizedDescription)")
            }
        }
    }
}
```

### 3. 注入项目 - .environment

```swift
import SwiftUI

@main
struct TodoAppSwiftApp: App {
    let persistenceController = PersistenceController.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
```

### 4. 调用

```swift
import CoreData
import SwiftUI

struct ContentView: View {
    // 获取托管对象上下文
    @Environment(\.managedObjectContext) private var viewContext

    // 创建获取请求，按创建时间降序排列
    @FetchRequest(
        sortDescriptors: [NSSortDescriptor(keyPath: \TodoItem.createdAt, ascending: false)],
        animation: .default)
    private var todoItems: FetchedResults<TodoItem>

    @State private var todoContent = ""

    var body: some View {}

 private func addTodo() {
        let trimmedContent = todoContent.trimmingCharacters(
            in: .whitespacesAndNewlines
        )
        guard !trimmedContent.isEmpty else { return }

        withAnimation {
            // 创建新的 TodoItem 对象
            let newTodo = TodoItem(context: viewContext)
            newTodo.id = UUID()
            newTodo.content = trimmedContent
            newTodo.createdAt = Date()
            newTodo.isDone = false

            // 保存到数据库
            saveTodos()
            todoContent = ""
        }
    }

    private func deleteTodos(offsets: IndexSet) {
        withAnimation {
            offsets.map { todoItems[$0] }.forEach(viewContext.delete)
            saveTodos()
        }
    }

    private func saveTodos() {
        do {
            try viewContext.save()
        } catch {
            let nsError = error as NSError
            print("无法保存: \(nsError), \(nsError.userInfo)")
        }
    }
}
```

## 4. SwiftData

如果你还是觉得 CoreData 有点繁琐，这个时候就不得不提 SwiftData 了。

使用 SwiftData 我们不再需要定义额外的文件来接入数据库，SwiftData 给我们提供了更加方便的形式。

### 1. 定义模型类

不再使用 .xcdatamodeld，你只需要 Swift 原生类 + @Model。

```swift
import SwiftData

@Model
class TodoItem {
    var content: String
    var createdAt: Date
    var isDone: Bool = false
    
    init(content: String, createdAt: Date = .now, isDone: Bool = false) {
        self.content = content
        self.createdAt = createdAt
        self.isDone = isDone
    }
}
```

### 2. 创建 SwiftData 的 ModelContainer

```swift
import SwiftData

@main
struct TodoAppSwiftApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: TodoItem.self) // SwiftData 注入
    }
}
```

### 3. 使用 @Query 获取数据

```swift
struct ContentView: View {
    @Query(sort: \TodoItem.createdAt, order: .reverse)
    private var todoItems: [TodoItem]
    // ...
}
```

### 4. 使用 @Environment(\.modelContext) 操作数据

```swift
struct ContentView: View {
    @Query(sort: \TodoItem.createdAt, order: .reverse)
    private var todoItems: [TodoItem]

 @Environment(\.modelContext) private var modelContext
    // ...
    private func addTodo() {
        let trimmedContent = todoContent.trimmingCharacters(
            in: .whitespacesAndNewlines
        )
        guard !trimmedContent.isEmpty else { return }
        
        withAnimation {
            // 创建新的 TodoItem 对象
            let newTodo = TodoItem( content: trimmedContent, createdAt: Date())
            
            
            modelContext.insert(newTodo)
            todoContent = ""
        }
    }
    
    private func deleteTodos(offsets: IndexSet) {
        withAnimation {
            offsets.map { todoItems[$0] }.forEach(modelContext.delete)
        }
    }
}
```

### 5. 在子视图中直接使用模型类（无须 @ObservedObject）

```swift
struct TodoRow: View {
    let todoItem: TodoItem
    @Environment(\.modelContext) private var modelContext

    var body: some View {
        Button(action: {
            todoItem.isDone.toggle()
            try? modelContext.save() // 可选保存
        }) {
            ...
        }
    }
}
```

但是 SwiftData 目前无法在 preview 模式下存储数据，这一点确实让人有点头疼。

## 小结

使用 Swift 存储数据的方式其实还有，但是我觉得目前对我来说已经差不多了，现在我要返回自己的项目中去了。
