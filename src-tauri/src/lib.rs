use tauri_plugin_sql::{Migration, MigrationKind};

fn sqlite_migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create personal to-do tables",
        sql: "
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY NOT NULL,
                updated_at TEXT NOT NULL,
                payload_json TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY NOT NULL,
                project_id TEXT NOT NULL,
                status TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                completed_at TEXT,
                payload_json TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
            CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
            CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at);
            CREATE TABLE IF NOT EXISTS focus_refs (
                task_id TEXT PRIMARY KEY NOT NULL,
                added_at TEXT NOT NULL,
                order_value INTEGER,
                payload_json TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY NOT NULL,
                type TEXT NOT NULL,
                created_at TEXT NOT NULL,
                payload_json TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
            CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
            CREATE TABLE IF NOT EXISTS preferences (
                id TEXT PRIMARY KEY NOT NULL,
                updated_at TEXT NOT NULL,
                payload_json TEXT NOT NULL
            );
        ",
        kind: MigrationKind::Up,
    }]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:yibu.db", sqlite_migrations())
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running 一步");
}
