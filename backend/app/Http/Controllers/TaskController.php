<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // Get all tasks with filtering, search and pagination
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Task::query();

        // Normal users can see only their own tasks
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $request->validate([
                'status' => 'in:todo,in-progress,done',
            ]);

            $query->where('status', $request->query('status'));
        }

        // Search by title
        if ($request->filled('search')) {
            $query->where(
                'title',
                'like',
                '%' . $request->query('search') . '%'
            );
        }

        // Pagination: 10 tasks per page
        $tasks = $query->orderBy('id', 'desc')->paginate(10);

        return response()->json([
            'success' => true,
            'data' => TaskResource::collection($tasks->items()),
            'pagination' => [
                'current_page' => $tasks->currentPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
                'last_page' => $tasks->lastPage(),
            ],
        ], 200);
    }

    // Create a new task
    public function store(StoreTaskRequest $request)
    {
        $user = $request->user();

        $validated = $request->validated();

        // Automatically assign the logged-in user
        $validated['user_id'] = $user->id;

        $task = Task::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Task created successfully',
            'data' => new TaskResource($task),
        ], 201);
    }

    // Update an existing task
    public function update(UpdateTaskRequest $request, $id)
    {
        $user = $request->user();

        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found',
            ], 404);
        }

        // Admin can update any task
        // Normal users can update only their own tasks
        if ($user->role !== 'admin' && $task->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to update this task',
            ], 403);
        }

        $validated = $request->validated();

        $task->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Task updated successfully',
            'data' => new TaskResource($task),
        ], 200);
    }

    // Delete an existing task
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found',
            ], 404);
        }

        // Admin can delete any task
        // Normal users can delete only their own tasks
        if ($user->role !== 'admin' && $task->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to delete this task',
            ], 403);
        }

        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully',
        ], 200);
    }

}
