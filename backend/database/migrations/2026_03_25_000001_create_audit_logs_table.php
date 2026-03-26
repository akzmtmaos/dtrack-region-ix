<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            // What happened
            $table->string('event_type'); // e.g. document.created, document.updated, destination.created, document.deleted
            $table->string('entity_type'); // e.g. document_source, document_destination
            $table->unsignedBigInteger('entity_id')->nullable();

            // Which document it belongs to (if applicable)
            $table->unsignedBigInteger('document_source_id')->nullable()->index();
            $table->string('document_control_no')->default('')->index();
            $table->string('route_no')->default('')->index();

            // Who did it
            $table->string('actor_employee_code')->default('')->index();
            $table->string('actor_display_name')->default('');
            $table->string('owner_employee_code')->default('')->index();

            // Extra details (safe to evolve without schema changes)
            $table->json('meta')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};

