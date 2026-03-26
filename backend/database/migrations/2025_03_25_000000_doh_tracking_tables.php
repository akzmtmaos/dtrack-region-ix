<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * MySQL schema mirroring Supabase tables used by the Django API.
 * Run after a fresh Laravel install: php artisan migrate
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('employee_code')->unique();
            $table->string('last_name');
            $table->string('first_name');
            $table->string('middle_name')->default('');
            $table->string('office')->nullable();
            $table->text('user_password');
            $table->string('user_level');
            $table->string('office_representative')->nullable();
            $table->boolean('verified')->default(false);
            $table->timestamps();
        });

        Schema::create('profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email')->nullable();
            $table->string('full_name')->nullable();
            $table->string('employee_code')->nullable()->index();
            $table->string('office')->nullable();
            $table->string('user_level')->nullable();
            $table->string('office_representative')->nullable();
            $table->timestamps();
        });

        Schema::create('action_required', function (Blueprint $table) {
            $table->id();
            $table->string('action_required');
            $table->timestamps();
        });

        Schema::create('action_officer', function (Blueprint $table) {
            $table->id();
            $table->string('employee_code');
            $table->string('last_name');
            $table->string('first_name');
            $table->string('middle_name')->default('');
            $table->string('office')->nullable();
            $table->text('user_password');
            $table->string('user_level');
            $table->string('office_representative')->nullable();
            $table->boolean('verified')->default(false);
            $table->timestamps();
        });

        Schema::create('action_taken', function (Blueprint $table) {
            $table->id();
            $table->string('action_taken');
            $table->timestamps();
        });

        Schema::create('document_type', function (Blueprint $table) {
            $table->id();
            $table->string('document_type');
            $table->timestamps();
        });

        Schema::create('document_action_required_days', function (Blueprint $table) {
            $table->id();
            $table->string('document_type');
            $table->string('action_required');
            $table->unsignedInteger('required_days')->default(0);
            $table->timestamps();
        });

        Schema::create('office', function (Blueprint $table) {
            $table->id();
            $table->string('office');
            $table->string('region')->nullable();
            $table->string('short_name')->nullable();
            $table->string('head_office')->nullable();
            $table->timestamps();
        });

        Schema::create('region', function (Blueprint $table) {
            $table->id();
            $table->string('region_name');
            $table->string('nscb_code');
            $table->string('nscb_name');
            $table->string('added_by');
            $table->string('status');
            $table->timestamps();
        });

        Schema::create('user_levels', function (Blueprint $table) {
            $table->id();
            $table->string('user_level_name');
            $table->timestamps();
        });

        Schema::create('document_source', function (Blueprint $table) {
            $table->id();
            $table->string('document_control_no')->default('');
            $table->string('route_no')->default('');
            $table->text('subject')->nullable();
            $table->string('document_type')->nullable();
            $table->string('source_type')->nullable();
            $table->text('internal_originating_office')->nullable();
            $table->text('internal_originating_employee')->nullable();
            $table->text('external_originating_office')->nullable();
            $table->text('external_originating_employee')->nullable();
            $table->string('no_of_pages')->nullable();
            $table->string('attached_document_filename')->nullable();
            $table->text('attachment_list')->nullable();
            $table->string('userid')->nullable();
            $table->string('current_custodian')->nullable();
            $table->string('in_sequence')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamp('deleted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('document_destination', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_source_id')->constrained('document_source')->cascadeOnDelete();
            $table->string('document_control_no')->default('');
            $table->string('route_no')->default('');
            $table->integer('sequence_no')->default(0);
            $table->string('destination_office')->nullable();
            $table->text('employee_action_officer')->nullable();
            $table->string('action_required')->nullable();
            $table->string('date_released')->nullable();
            $table->string('time_released')->nullable();
            $table->string('date_required')->nullable();
            $table->string('time_required')->nullable();
            $table->string('date_received')->nullable();
            $table->string('time_received')->nullable();
            $table->text('remarks')->nullable();
            $table->string('action_taken')->nullable();
            $table->text('remarks_on_action_taken')->nullable();
            $table->string('date_acted_upon')->nullable();
            $table->string('time_acted_upon')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_destination');
        Schema::dropIfExists('document_source');
        Schema::dropIfExists('user_levels');
        Schema::dropIfExists('region');
        Schema::dropIfExists('office');
        Schema::dropIfExists('document_action_required_days');
        Schema::dropIfExists('document_type');
        Schema::dropIfExists('action_taken');
        Schema::dropIfExists('action_officer');
        Schema::dropIfExists('action_required');
        Schema::dropIfExists('profiles');
        Schema::dropIfExists('users');
    }
};
