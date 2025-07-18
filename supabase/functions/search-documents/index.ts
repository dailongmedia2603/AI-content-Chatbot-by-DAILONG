// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()
    if (!query) {
      throw new Error("Yêu cầu thiếu 'query'.")
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: aiSettings, error: settingsError } = await supabaseAdmin
      .from('ai_settings')
      .select('api_url, api_key, embedding_model_name')
      .eq('id', 1)
      .single()

    if (settingsError || !aiSettings || !aiSettings.api_key || !aiSettings.api_url) {
      throw new Error('Vui lòng cấu hình API trong trang Cài đặt API AI.')
    }
    
    const { data: proxyResponse, error: proxyError } = await supabaseAdmin.functions.invoke('multi-ai-proxy', {
        body: {
            input: query,
            apiUrl: aiSettings.api_url,
            apiKey: aiSettings.api_key,
            embeddingModelName: aiSettings.embedding_model_name,
        }
    });

    if (proxyError) throw new Error(`Lỗi gọi AI Proxy: ${(await proxyError.context.json()).error || proxyError.message}`);
    if (proxyResponse.error) throw new Error(`Lỗi từ AI Proxy: ${proxyResponse.error}`);
    if (!proxyResponse.data || !proxyResponse.data[0] || !proxyResponse.data[0].embedding) {
        throw new Error('Phản hồi từ proxy không chứa embedding hợp lệ.');
    }

    const queryEmbedding = proxyResponse.data[0].embedding;

    const { data: documents, error: matchError } = await supabaseAdmin.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7, // Giảm ngưỡng để linh hoạt hơn
      match_count: 10, // Tăng số lượng kết quả để có nhiều lựa chọn hơn
    })

    if (matchError) {
      throw new Error(`Lỗi tìm kiếm tài liệu: ${matchError.message}`)
    }

    return new Response(JSON.stringify(documents), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})