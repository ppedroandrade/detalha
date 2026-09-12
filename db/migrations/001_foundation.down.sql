DROP TABLE download_grants,audit_logs,processing_inputs,processing_runs,project_file_versions,project_files,rate_limits,sessions,apartment_items,environments,projects,clients,organization_members,organizations,app_users CASCADE;
DROP FUNCTION IF EXISTS can_user(text),staff_project(text),can_project(text),is_member(text),is_staff(text),current_actor();
DROP ROLE detalha_app;
DROP FUNCTION IF EXISTS bump_project_revision(text,integer);
