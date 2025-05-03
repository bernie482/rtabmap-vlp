#include <iostream>
#include <cstring>
#include <cstdlib>
#include <ctime>
#include <iomanip>
using namespace std;

class list
{
   public:
   int num;
   class list *next;
};
typedef class list node;
typedef node  *link;

link findnode (link,int);
link Insert_Node (link,link,int);

int main(){
    link ptr,newnode = NULL;
    int number,Insert_Number,position,new_num = 0;
    link head = new node;
    if(!head){
        cout<<"Error"<<endl;
        exit(1);
    }
    cout<<"��J�Ʀr"<<endl;
    cin>>number;
    head->num = number;
    head->next = NULL;
    ptr = head;
    cout<<"��J���U�Ӫ��Ʀr"<<endl;
    for (int i=0;i<6;i++){
        cin>>Insert_Number;
        newnode->num = Insert_Number;
        newnode->next = NULL;
        ptr->next = newnode;
        ptr = newnode;
    }
    while (1)
    {
        cout<<"��J���J��m,������-1:";
        cin>>position;
        if(position == -1)
           break;
        else{
            ptr = findnode(head, position);
            cout<<"���J�s��m���Ʀr"<<endl;
            cin >> new_num;
            head = Insert_Node(head, ptr, new_num);
        }
        
    }
    ptr = head;
    while(ptr!=NULL){
        cout<<"["<<ptr->num<<"]"<<endl;
        //cout<<"\n"<<endl;
        ptr = ptr->next;
    }
   delete head;
   system("pause");
   return 0 ;
     
}
link findnode(link head, int num){
    link ptr;
    ptr = head;
    while (ptr!=NULL)
    {
        if (ptr->num == num)
          return ptr;
        ptr = ptr ->next;
    }
    return ptr;
}
link Insert_Node(link head, link ptr, int num){
    link InsertNode;
    InsertNode = new node;
    InsertNode->num = num;
    InsertNode->next =NULL;
    if(InsertNode == NULL){
        cout<< "�O����t�m����"<<endl;
        return NULL;
    }
    else{
        if(head == NULL){
            InsertNode ->next = head;
            return InsertNode;
        }
        else{
            if(ptr->next == NULL){
                ptr->next = InsertNode;
            }
            else{
                InsertNode->next = ptr->next;
                ptr->next = InsertNode;
            }
        }
        return head;
    }
}