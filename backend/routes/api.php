
<?php

use App\Http\Controllers\TaskController;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;

// Route::get('/hello', function () {
//     return response()->json([
//         'success' => true,
//         'message' => 'Task Manager API is working!',
//     ]);
// });

Route::middleware('auth:sanctum')->group(function () {


    Route::get('/tasks', [TaskController::class, 'index']);


    Route::post('/tasks', [TaskController::class, 'store']);

    Route::put('/tasks/{id}', [TaskController::class, 'update']);

    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);

});


Route::post('/register', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:8',
    ]);

    $user = User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => Hash::make($validated['password']),
        'role' => 'user',
    ]);

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'success' => true,
        'message' => 'User registered successfully',
        'user' => $user,
        'token' => $token,
    ], 201);
});


Route::post('/login', function (Request $request) {
    $validated = $request->validate([
        'email' => 'required|email',
        'password' => 'required|string',
    ]);

    $user = User::where('email', $validated['email'])->first();

    if (!$user || !Hash::check($validated['password'], $user->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid email or password',
        ], 401);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'success' => true,
        'message' => 'Login successful',
        'user' => $user,
        'token' => $token,
    ], 200);
});





