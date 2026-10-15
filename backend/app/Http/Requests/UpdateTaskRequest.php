<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    // Allow the request to proceed to validation
    public function authorize(): bool
    {
        return true;
    }

    // Validation rules for updating a task
    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'status' => 'sometimes|in:todo,in-progress,done',
            'priority' => 'sometimes|in:low,medium,high',
            'due_date' => 'sometimes|nullable|date',
        ];
    }

    // Custom validation error messages
    public function messages(): array
    {
        return [
            'title.required' => 'Task title cannot be empty.',
            'title.max' => 'Task title cannot exceed 255 characters.',
            'status.in' => 'Status must be todo, in-progress, or done.',
            'priority.in' => 'Priority must be low, medium, or high.',
            'due_date.date' => 'Please provide a valid due date.',
        ];
    }

}
