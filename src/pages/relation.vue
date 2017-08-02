<template>
	<div>
		<Table :columns="columns" :data="data"></Table>
	</div>
</template>
<script>
	export default {
		name:'RelTable',
		data(){
			return {
				columns:[{
					title:'已关联主题',
					key:'name'
				}],
				data:[
					{
                        name: '王小明sdfsdf'
                    }
				]
			}
		}
	}
</script>