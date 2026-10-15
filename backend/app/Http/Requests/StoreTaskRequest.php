<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    // Allow authenticated users to make this request
    public function authorize(): bool
    {
        return true;
    }

    // Validation rules for creating a task
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:todo,in-progress,done',
            'priority' => 'sometimes|in:low,medium,high',
            'due_date' => 'nullable|date',
        ];
    }

    // Custom validation error messages
    public function messages(): array
    {
        return [
            'title.required' => 'Task title is required.',
            'title.max' => 'Task title cannot exceed 255 characters.',
            'status.in' => 'Status must be todo, in-progress, or done.',
            'priority.in' => 'Priority must be low, medium, or high.',
            'due_date.date' => 'Please provide a valid due date.',
        ];
    }
}
