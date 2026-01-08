/**
 * Test the project chat API with the new Google SDK integration
 */

async function testProjectChat() {
    console.log('🧪 Testing Project Chat API with Google SDK...\n');

    // Get the first project ID
    const projectsResponse = await fetch('http://localhost:3000/api/projects');
    const projects = await projectsResponse.json();

    if (!projects || projects.length === 0) {
        console.error('❌ No projects found');
        return;
    }

    const projectId = projects[0].id;
    console.log(`✅ Using project: ${projects[0].name} (${projectId})\n`);

    // Test 1: Simple chat message
    console.log('Test 1: Simple greeting...');
    const response1 = await fetch(`http://localhost:3000/api/projects/${projectId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [
                { role: 'user', content: 'Hello! Can you give me a brief overview of this project?' }
            ]
        })
    });

    const result1 = await response1.json();
    console.log('Response:', result1.text?.substring(0, 200) + '...');
    console.log('Tool calls:', result1.toolCalls?.length || 0, '\n');

    // Test 2: Tool calling - create a phase
    console.log('Test 2: Creating a new phase...');
    const response2 = await fetch(`http://localhost:3000/api/projects/${projectId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [
                { role: 'user', content: 'Create a new phase called "Testing Phase" with objective "Verify all systems work" and order 99' }
            ]
        })
    });

    const result2 = await response2.json();
    console.log('Response:', result2.text);
    console.log('Tool calls:', JSON.stringify(result2.toolCalls, null, 2));

    if (result2.toolCalls && result2.toolCalls.length > 0) {
        console.log('\n✅ SUCCESS! Tool calling is working!');
    } else {
        console.log('\n⚠️  No tool calls detected');
    }

    // Verify the phase was created
    console.log('\nVerifying phase creation...');
    const verifyResponse = await fetch(`http://localhost:3000/api/projects/${projectId}/tasks`);
    const tasks = await verifyResponse.json();
    const testingPhase = tasks.taskGroups?.find((g: any) => g.title === 'Testing Phase');

    if (testingPhase) {
        console.log('✅ Phase created successfully:', testingPhase.title);
    } else {
        console.log('❌ Phase not found in database');
    }
}

testProjectChat().catch(console.error);
