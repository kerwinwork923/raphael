export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // 這裡應該調用實際的後台 API
    // 目前只是模擬回應
    console.log('發送文字訊息:', body);
    
    return {
      success: true,
      message: '文字訊息發送成功',
      data: body
    };
  } catch (error) {
    console.error('發送文字訊息錯誤:', error);
    throw createError({
      statusCode: 500,
      statusMessage: '發送文字訊息失敗'
    });
  }
});
