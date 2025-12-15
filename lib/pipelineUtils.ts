import { supabase } from '../lib/supabase';
import { PipelineStage } from '../types';

const STRICT_STAGES = [
    { name: 'New', color: 'bg-gray-200' },
    { name: 'Contacted', color: 'bg-blue-200' },
    { name: 'Qualified', color: 'bg-indigo-200' },
    { name: 'Negotiation', color: 'bg-orange-200' },
    { name: 'Closed', color: 'bg-green-200' },
    { name: 'Lost', color: 'bg-red-200' },
];

export const repairPipelineStages = async (pipelineId: string, currentStages: any[]) => {
    // 1. Sort current stages by order (or created_at if order is 0)
    const sortedStages = [...currentStages].sort((a, b) => a.order_index - b.order_index);

    const neededStages = [...STRICT_STAGES];
    const finalStageIds: string[] = [];

    // 2. Iterate through strict slots
    for (let i = 0; i < neededStages.length; i++) {
        const target = neededStages[i];

        if (i < sortedStages.length) {
            // We have an existing stage at this slot (roughly). Reuse it!
            const existing = sortedStages[i];

            // If name or color doesn't match, update it
            if (existing.name !== target.name || existing.order_index !== i) {
                console.log(`Repairing stage ${existing.name} -> ${target.name}`);
                await supabase
                    .from('pipeline_stages')
                    .update({ name: target.name, color: target.color, order_index: i })
                    .eq('id', existing.id);
            }
            finalStageIds.push(existing.id);
        } else {
            // We ran out of existing stages. Create new one.
            console.log(`Creating missing stage ${target.name}`);
            const { data } = await supabase
                .from('pipeline_stages')
                .insert({
                    pipeline_id: pipelineId,
                    name: target.name,
                    color: target.color,
                    order_index: i
                })
                .select()
                .single();

            if (data) finalStageIds.push(data.id);
        }
    }

    // 3. Handle Extra Stages (if user had more than 6)
    if (sortedStages.length > neededStages.length) {
        const extraStages = sortedStages.slice(neededStages.length);
        const newStageId = finalStageIds[0]; // fallback to 'New'

        for (const stage of extraStages) {
            console.log(`Cleaning up extra stage ${stage.name}`);
            // Move leads first
            await supabase
                .from('leads')
                .update({ pipeline_stage_id: newStageId, status: 'New' })
                .eq('pipeline_stage_id', stage.id);

            // Delete stage
            await supabase
                .from('pipeline_stages')
                .delete()
                .eq('id', stage.id);
        }
    }

    return true;
};
