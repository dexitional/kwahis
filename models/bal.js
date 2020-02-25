module.exports = (db,indexno) => {  
        let row = null;        
        db.query("select t.*,b.min_pay from transact t left join bill b on t.bill = b.id where t.action = 'C' and t.index_number = '"+indexno+"' order by id desc limit 1; select sum(amount) as debt from transact where action = 'C' and index_number = '"+indexno+"'; select sum(amount) as paid from transact where action = 'D' and index_number = '"+indexno+"'",(err,rex)=>{                                                           
            if(err) console.log(err);  
            console.log(indexno);                        
            
            const cur_bill = row.cur_bill = rex[0][0].amount || 0;
            const cur_minpay = row.cur_minpay = rex[0][0].min_pay || 0;
            const debt = row.debt = (rex[1][0].debt - cur_bill) || 0;
            const paid = row.paid = rex[2][0].paid || 0;
            const bal = row.bal = debt - paid;
            const charge = row.charge = cur_bill + debt;
            const tbal = row.tbal = charge - paid;
            
            return rows;      
            db.release();
        });    
}